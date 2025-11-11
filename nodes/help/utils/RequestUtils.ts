import { IExecuteFunctions } from 'n8n-workflow';
import { IRequestOptions } from 'n8n-workflow/dist/Interfaces';

class RequestUtils {
	static async originRequest(
		this: IExecuteFunctions,
		options: IRequestOptions,
	) {
		const credentialName = 'feishuProjectApi';
		const credentials = await this.getCredentials(credentialName);
		options.baseURL = `https://${credentials.baseUrl}`;
		return this.helpers.requestWithAuthentication.call(this, credentialName, options)
	}

	static async request(this: IExecuteFunctions, options: IRequestOptions) {
		if (options.json === undefined) options.json = true;
		return RequestUtils.originRequest.call(this, options).then((data) => {
			const handleResponse = (response: any) => {
				let isNormalCode = response?.err_code === 0 || response?.error?.code === 0 || response?.err?.code === 0
				if (isNormalCode) {
					return response
				}
				throw new Error(
`[${options.method}]${options.url}
					[req]${JSON.stringify(options?.body)}
					[res]${JSON.stringify(response)}`,
				);
			};

			// 处理一次 pluginToken 过期的情况
			const isExpireCode = data?.err?.code === 10022 || data?.err_code === 10022 || data?.error?.code === 10022
			if (isExpireCode) {
				return RequestUtils.originRequest.call(this, options).then((res) => {
					return handleResponse(res);
				});
			}

			return handleResponse(data);
		});
	}
}

export default RequestUtils;
