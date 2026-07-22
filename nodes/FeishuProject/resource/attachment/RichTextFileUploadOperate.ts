import { IDataObject, IExecuteFunctions, IHttpRequestOptions, NodeOperationError } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';
import FormData from 'form-data';

/**
 * 文件上传最大大小限制 (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const parseUploadResponse = (response: unknown): string | undefined => {
	// processResponse 可能直接返回 data 字符串（URL）
	if (typeof response === 'string') {
		const trimmed = response.trim();
		if (!trimmed) {
			return undefined;
		}

		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			try {
				return parseUploadResponse(JSON.parse(trimmed));
			} catch {
				return trimmed.startsWith('http') ? trimmed : undefined;
			}
		}

		return trimmed;
	}

	// multipart 上传时，n8n 有时返回 Buffer，processResponse 会原样透传
	if (Buffer.isBuffer(response) || response instanceof Uint8Array) {
		try {
			return parseUploadResponse(JSON.parse(Buffer.from(response).toString('utf-8')));
		} catch {
			return undefined;
		}
	}

	// data 为数组：["https://..."]，取第一个有效字符串
	if (Array.isArray(response)) {
		for (const item of response) {
			const url = parseUploadResponse(item);
			if (url) {
				return url;
			}
		}
		return undefined;
	}

	// 完整响应对象：{ data: "https://..." } 或 { data: ["https://..."] }
	if (response && typeof response === 'object') {
		return parseUploadResponse((response as IDataObject).data);
	}

	return undefined;
};

const RichTextFileUploadOperate: ResourceOperations = {
	name: '上传文件或富文本图片',
	value: 'file:upload',
	order: 20,
	description:
		'通用文件上传接口，主要用于富文本中上传图片。',
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description:
				'包含要上传文件的二进制数据字段名。form 表单字段名为 file，目前最大支持 100MB。详见：<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/g33r3mo4">文件上传</a>',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const file = await NodeUtils.buildUploadFileData.call(this, binaryPropertyName, index);

		if (!file || !file.value) {
			throw new NodeOperationError(
				this.getNode(),
				'未找到文件数据，请检查二进制文件字段名是否正确',
			);
		}

		const fileSize = file.value.length;
		if (fileSize > MAX_FILE_SIZE) {
			throw new NodeOperationError(
				this.getNode(),
				`文件大小 (${Math.round(fileSize / 1024 / 1024)}MB) 超过限制，附件最大支持100MB`,
			);
		}

		const formData = new FormData();
		formData.append('file', file.value, {
			filename: file.options.filename || 'file',
			contentType: file.options.contentType || 'application/octet-stream',
		});

		const response = await RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/file/upload`,
			body: formData,
			headers: formData.getHeaders(),
			timeout: options.timeout,
		} as IHttpRequestOptions);

		const fileUrl = parseUploadResponse(response);
		if (!fileUrl) {
			throw new NodeOperationError(this.getNode(), '上传成功但未返回资源路径');
		}

		return { fileUrl };
	},
};

export default RichTextFileUploadOperate;
