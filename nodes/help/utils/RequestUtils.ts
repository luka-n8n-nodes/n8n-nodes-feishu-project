import { IExecuteFunctions, IHttpRequestOptions, JsonObject, NodeApiError } from 'n8n-workflow';

/**
 * 飞书项目 API 错误码帮助文档 URL
 */
const ERROR_HELP_URL = 'https://project.feishu.cn/b/helpcenter/1p8d7djs/5aueo3jr';

/**
 * 需要刷新 Token 的错误码列表
 * - 10022: pluginToken 过期
 * - 10211: Token Info Is Invalid（token 信息无效）
 */
const TOKEN_REFRESH_ERROR_CODES = [10022, 10211];

/**
 * 飞书项目 API 请求工具类
 */
class RequestUtils {
	/**
	 * 处理飞书项目 API 响应
	 * - 二进制数据直接返回
	 * - 检查 err_code 是否为 0，非 0 则抛出错误
	 * - 返回 data 字段或原始响应
	 */
	private static processResponse(res: any) {
		// 对于二进制数据（如文件下载），直接返回
		if (res instanceof Buffer || res instanceof ArrayBuffer || res instanceof Uint8Array) {
			return res;
		}

		// 飞书项目 API 正常响应判断
		const isNormalCode = res?.err_code === 0;
		if (!isNormalCode) {
			throw new Error(`Feishu Project API Error: ${res?.err_code}, ${res?.err_msg}`);
		}

		// 如果有分页信息，返回完整响应（包含 data 和 pagination）
		if (res.pagination) {
			return res;
		}

		// 直接返回 data 字段，如果没有则返回原始响应
		return res.data ?? res;
	}

	/**
	 * 原始请求方法（带认证）
	 */
	static async originRequest(
		this: IExecuteFunctions,
		options: IHttpRequestOptions,
		clearPluginToken = false,
	) {
		const credentialName = 'feishuProjectApi';
		const credentials = await this.getCredentials(credentialName);
		options.baseURL = `https://${credentials.baseUrl}`;

		// 如果需要清除 pluginToken，设置为空以触发重新获取
		if (clearPluginToken) {
			const additionalCredentialOptions = {
				credentialsDecrypted: {
					id: 'feishu-project-credentials',
					name: credentialName,
					type: 'feishuProjectApi',
					data: {
						...credentials,
						pluginToken: '',
					},
				},
			};

			return this.helpers.httpRequestWithAuthentication.call(
				this,
				credentialName,
				options,
				additionalCredentialOptions,
			);
		}

		return this.helpers.httpRequestWithAuthentication.call(this, credentialName, options);
	}

	/**
	 * 封装请求方法，包含错误处理和 token 过期重试
	 */
	static async request(this: IExecuteFunctions, options: IHttpRequestOptions) {
		if (options.json === undefined) options.json = true;

		return RequestUtils.originRequest
			.call(this, options)
			.then((res) => RequestUtils.processResponse(res))
			.catch((error) => {
				// 处理错误响应
				if (error.context && error.context.data) {
					let errorData: any = {};

					if (error.context.data.err_code !== undefined) {
						// 已经是解析好的对象
						errorData = error.context.data;
					} else {
						// 尝试从 Buffer 解析 JSON（下载资源操作返回的是 arraybuffer 格式）
						const buffer = Buffer.from(error.context.data);
						if (buffer.length > 0) {
							try {
								errorData = JSON.parse(buffer.toString('utf-8'));
							} catch {
								// JSON 解析失败，直接抛出原始错误
								throw error;
							}
						} else {
							// Buffer 为空（如 404 等 HTTP 错误），直接抛出原始错误
							throw error;
						}
					}

					const { err_code, err_msg, err } = errorData;

					// Token 相关错误码：自动刷新 token 并重试
					if (TOKEN_REFRESH_ERROR_CODES.includes(err_code)) {
						return RequestUtils.originRequest
							.call(this, options, true)
							.then((res) => RequestUtils.processResponse(res));
					}

					// 其他错误码：抛出 NodeApiError
					if (err_code !== 0) {
						// 构建错误描述，包含排查建议
						const description = err?.msg
							? `${err.msg}${err.log_id ? ` (log_id: ${err.log_id})` : ''}`
							: `错误码: ${err_code}，请参考排查文档: ${ERROR_HELP_URL}`;

						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: `飞书项目 API 错误: ${err_code}, ${err_msg}`,
							description,
						});
					}
				}

				// 处理响应中的错误（非 HTTP 错误，但 err_code 不为 0）
				if (error.message && error.message.includes('Feishu Project API Error')) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: error.message,
						description: `请参考排查文档: ${ERROR_HELP_URL}`,
					});
				}

				throw error;
			});
	}
}

export default RequestUtils;
