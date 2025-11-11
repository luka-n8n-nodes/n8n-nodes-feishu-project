import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';

const AttachmentDownloadOperate: ResourceOperations = {
	name: '下载附件',
	value: 'attachment:download',
	options: [
		{
			displayName: '空间ID',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '空间 ID (project_key) 或空间域名 (simple_name)。project_key 在飞书项目空间双击空间名称获取；simple_name 一般在飞书项目空间 URL 中获取，例如空间 URL为"https://project.feishu.cn/doc/overview"，则 simple_name 为"doc"',
		},
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型，由系统自动生成，可通过空间下工作项类型接口获取',
		},
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，可在工作项实例详情右上角展开"..."获取ID',
		},
		{
			displayName: '附件ID',
			name: 'uuid',
			type: 'string',
			required: true,
			default: '',
			description: '附件 ID，当前最大支持100MB。可从工作项详情接口下的富文本(multi_texts)或附件字段(multi_file类型)中获取',
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
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const uuid = this.getNodeParameter('uuid', index) as string;
		const outputPropertyName = this.getNodeParameter('outputPropertyName', index, 'data') as string;
		const options = this.getNodeParameter('options', index, {}) as {
			fileName?: string;
			mimeType?: string;
		};

		const body: IDataObject = {
			uuid: uuid,
		};

		// 使用 requestWithAuthentication 直接请求，参考 HttpRequest 节点的实现
		const credentialName = 'feishuProjectApi';
		const credentials = await this.getCredentials(credentialName);
		const baseURL = `https://${credentials.baseUrl}`;

		// 参考 HttpRequest 节点：设置 encoding: null, json: false, useStream: true 来处理二进制数据
		const response = await this.helpers.requestWithAuthentication.call(this, credentialName, {
			method: 'POST',
			baseURL: baseURL,
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/download`,
			body: body,
			encoding: null,
			json: false,
			useStream: true,
			resolveWithFullResponse: true,
		} as any);

		// 参考 HttpRequest 节点：从响应头获取 Content-Type
		const responseContentType = response.headers?.['content-type'] || response.headers?.['Content-Type'] || '';

		// 参考 HttpRequest 节点的 binaryContentTypes 判断是否是二进制文件
		const binaryContentTypes = [
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

		const isFileResponse = binaryContentTypes.some((type) => responseContentType.includes(type)) ||
		                       (!responseContentType.includes('application/json') && response.body && typeof response.body !== 'object');

		// 如果是文件响应
		if (isFileResponse && response.body) {
			// 确定 MIME 类型：优先使用用户自定义的，其次使用响应头中的
			let mimeType: string | undefined = undefined;
			if (options.mimeType && options.mimeType.trim()) {
				mimeType = options.mimeType.trim();
			} else {
				mimeType = responseContentType ? responseContentType.split(' ')[0].split(';')[0] : undefined;
			}

			// 确定文件名：优先使用用户自定义的，其次从响应头获取，最后使用 uuid
			let fileName: string | undefined = undefined;
			if (options.fileName && options.fileName.trim()) {
				fileName = options.fileName.trim();
			} else {
				const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'] || '';
				if (contentDisposition) {
					const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
					if (fileNameMatch && fileNameMatch[1]) {
						fileName = fileNameMatch[1].replace(/['"]/g, '');
					}
				}
				// 如果还是没有获取到文件名，使用 uuid
				if (!fileName) {
					fileName = uuid;
				}
			}

			// 参考 HttpRequest 节点：准备二进制数据
			const binaryData = await this.helpers.prepareBinaryData(
				response.body as Buffer,
				fileName,
				mimeType,
			);

			return {
				json: {},
				binary: {
					[outputPropertyName]: binaryData,
				},
			};
		}

		// 如果不是文件响应，尝试解析为 JSON 并检查错误
		let responseData: any;
		try {
			// 参考 HttpRequest 节点：使用 binaryToString 处理响应体
			if (response.body instanceof Buffer) {
				const data = await this.helpers.binaryToString(response.body);
				responseData = JSON.parse(data);
			} else {
				responseData = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
			}
		} catch (e) {
			responseData = response.body;
		}

		// 检查是否是错误响应
		const isNormalCode = responseData?.err_code === 0 || responseData?.error?.code === 0 || responseData?.err?.code === 0;
		if (!isNormalCode) {
			throw new Error(
				`[POST]/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/download
				[req]${JSON.stringify(body)}
				[res]${JSON.stringify(responseData)}`,
			);
		}

		// 返回 JSON 响应
		return responseData;
	}
};

export default AttachmentDownloadOperate;
