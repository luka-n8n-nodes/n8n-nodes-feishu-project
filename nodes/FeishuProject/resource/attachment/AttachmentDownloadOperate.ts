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

const AttachmentDownloadOperate: ResourceOperations = {
	name: '下载附件',
	value: 'attachment:download',
	order: 20,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Work Item Type Name or ID',
			name: 'work_item_type_key',
			type: 'options',
			default: '',
			required: true,
			description: '选择工作项类型。需要先选择空间。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemTypes',
			},
		},
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: '附件ID',
			name: 'uuid',
			type: 'string',
			required: true,
			default: '',
			description:
				'附件 ID，当前最大支持100MB。可从工作项详情接口下的富文本(multi_texts)或附件字段(multi_file类型)中获取',
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
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const uuid = this.getNodeParameter('uuid', index) as string;
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

		const body: IDataObject = { uuid };
		const url = `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/download`;

		// 获取凭证
		const credentialName = 'feishuProjectApi';
		const credentials = await this.getCredentials(credentialName);
		const baseURL = `https://${credentials.baseUrl}`;

		// 构建请求选项
		const requestOptions: any = {
			method: 'POST',
			baseURL,
			url,
			body,
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
			const mimeType = options.mimeType?.trim() || responseContentType.split(';')[0].trim() || undefined;

			// 确定文件名
			let fileName = options.fileName?.trim();
			if (!fileName) {
				const contentDisposition =
					response.headers?.['content-disposition'] ||
					response.headers?.['Content-Disposition'] ||
					'';
				const fileNameMatch = contentDisposition.match(
					/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
				);
				fileName = fileNameMatch?.[1]?.replace(/['"]/g, '') || uuid;
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
		if (responseData?.err_code !== 0) {
			const description = responseData?.err?.msg
				? `${responseData.err.msg}${responseData.err.log_id ? ` (log_id: ${responseData.err.log_id})` : ''}`
				: `错误码: ${responseData?.err_code}，请参考排查文档: ${ERROR_HELP_URL}`;

			throw new NodeApiError(this.getNode(), responseData, {
				message: `飞书项目 API 错误: ${responseData?.err_code}, ${responseData?.err_msg}`,
				description,
			});
		}

		// 返回 data 字段
		return responseData.data ?? responseData;
	},
};

export default AttachmentDownloadOperate;
