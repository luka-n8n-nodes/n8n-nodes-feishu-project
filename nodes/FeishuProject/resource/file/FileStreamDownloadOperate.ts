import { IDataObject, IExecuteFunctions, NodeApiError } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOption } from '../../../help/utils/sharedOptions';
import { ERROR_HELP_URL } from '../../../help/type/enums';
import { DESCRIPTIONS } from '../../../help/description';

/**
 * 二进制内容类型列表
 */
const BINARY_CONTENT_TYPES = [
	'image/',
	'audio/',
	'video/',
	'application/octet-stream',
	'application/gzip',
	'application/zip',
	'application/vnd.rar',
	'application/epub+zip',
	'application/x-bzip',
	'application/x-bzip2',
	'application/x-cdf',
	'application/vnd.amazon.ebook',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-fontobject',
	'application/vnd.oasis.opendocument.presentation',
	'application/pdf',
	'application/x-tar',
	'application/vnd.visio',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/x-7z-compressed',
];

const FileStreamDownloadOperate: ResourceOperations = {
	name: '下载文件',
	value: 'file:download',
	order: 20,
	description: '下载一个附件。文件需已绑定到评论等业务中，未绑定业务点位前不能下载。',
	options: [
		{
			displayName:
				'该接口用于下载一个附件。上传完成的文件，需要再绑定到评论等业务中，在未绑定到业务点位之前不能下载，超过 7 天未绑定业务点位会自动删除文件。',
			name: 'downloadNotice',
			type: 'notice',
			default: '',
		},
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '文件 Token',
			name: 'file_token',
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
			type: 'string',
			required: true,
			default: '',
			description: '文件 token，通过上传文件接口获取',
		},
		{
			displayName: 'Put Output File in Field',
			name: 'outputPropertyName',
			type: 'string',
			default: 'data',
			description: 'The name of the output binary field to put the file in',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			options: [
				{
					displayName: 'File Name',
					name: 'fileName',
					type: 'string',
					default: '',
					placeholder: 'e.g. myFile',
					description: 'The name of the output file',
				},
				{
					displayName: 'MIME Type',
					name: 'mimeType',
					type: 'string',
					default: '',
					placeholder: 'e.g. text/plain',
					description: 'The MIME type of the output file',
				},
				timeoutOption,
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const file_token = this.getNodeParameter('file_token', index) as string;
		const outputPropertyName = this.getNodeParameter(
			'outputPropertyName',
			index,
			'data',
		) as string;
		const options = this.getNodeParameter('options', index, {}) as {
			fileName?: string;
			mimeType?: string;
			timeout?: number;
		};

		const url = `/open_api/${project_key}/file/stream/download/${file_token}`;

		// 获取凭证
		const credentialName = 'feishuProjectApi';
		const credentials = await this.getCredentials(credentialName);
		const baseURL = `https://${credentials.baseUrl}`;

		// 构建请求选项
		const requestOptions: any = {
			method: 'GET',
			baseURL,
			url,
			encoding: null,
			json: false,
			useStream: true,
			resolveWithFullResponse: true,
		};

		// 添加超时选项
		if (options.timeout) {
			requestOptions.timeout = options.timeout;
		}

		// 发送请求
		const response = await this.helpers.requestWithAuthentication.call(
			this,
			credentialName,
			requestOptions,
		);

		// 获取响应内容类型
		const responseContentType =
			response.headers?.['content-type'] || response.headers?.['Content-Type'] || '';

		// 判断是否是二进制文件响应
		const isFileResponse =
			BINARY_CONTENT_TYPES.some((type) => responseContentType.includes(type)) ||
			(!responseContentType.includes('application/json') &&
				response.body &&
				typeof response.body !== 'object');

		// 处理文件响应
		if (isFileResponse && response.body) {
			// 确定 MIME 类型
			const mimeType =
				options.mimeType?.trim() || responseContentType.split(';')[0].trim() || undefined;

			// 确定文件名
			let fileName = options.fileName?.trim();
			if (!fileName) {
				const contentDisposition =
					response.headers?.['content-disposition'] ||
					response.headers?.['Content-Disposition'] ||
					'';
				const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
				fileName = fileNameMatch?.[1]?.replace(/['"]/g, '') || file_token;
			}

			// 准备二进制数据
			const binaryData = await this.helpers.prepareBinaryData(
				response.body as Buffer,
				fileName,
				mimeType,
			);

			return {
				binary: {
					[outputPropertyName]: binaryData,
				},
				json: binaryData,
			};
		}

		// 处理 JSON 响应（可能是错误响应）
		let responseData: any;
		try {
			if (response.body instanceof Buffer) {
				const data = await this.helpers.binaryToString(response.body);
				responseData = JSON.parse(data);
			} else {
				responseData =
					typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
			}
		} catch {
			responseData = response.body;
		}

		// 检查是否是错误响应
		// 该接口失败时返回 { code, message, data }，兼容标准接口的 err_code / err_msg
		const respCode = responseData?.err_code ?? responseData?.code;
		const respMsg = responseData?.err_msg ?? responseData?.message;
		if (respCode !== 0) {
			const description = responseData?.err?.msg
				? `${responseData.err.msg}${responseData.err.log_id ? ` (log_id: ${responseData.err.log_id})` : ''}`
				: `错误码: ${respCode}，请参考排查文档: ${ERROR_HELP_URL}`;

			throw new NodeApiError(this.getNode(), responseData, {
				message: `飞书项目 API 错误: ${respCode}, ${respMsg}`,
				description,
			});
		}

		// 返回 data 字段
		return responseData.data ?? responseData;
	},
};

export default FileStreamDownloadOperate;
