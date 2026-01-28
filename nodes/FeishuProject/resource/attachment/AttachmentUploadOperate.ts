import { IDataObject, IExecuteFunctions, IHttpRequestOptions, NodeOperationError } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { batchingOption, timeoutOption } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';
import FormData from 'form-data';

/**
 * 文件上传最大大小限制 (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const AttachmentUploadOperate: ResourceOperations = {
	name: '添加附件',
	value: 'attachment:upload',
	order: 10,
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
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: '包含要上传文件的二进制数据字段名，附件最大支持100MB',
		},
		{
			displayName: '附件字段 Name or ID',
			name: 'field_key',
			type: 'options',
			default: '',
			description: '选择要上传附件的目标字段。需要先选择空间和工作项类型。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadAttachmentFields',
			},
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: '自定义文件名',
					name: 'file_name',
					type: 'string',
					default: '',
					description: '带后缀的文件名，例如：test.pdf。不填则使用原始文件名',
				},
				{
					displayName: '数组下标',
					name: 'index',
					type: 'string',
					default: '',
					description: '复合字段适用，用于指定数组下标',
				},
				batchingOption,
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
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const field_key = this.getNodeParameter('field_key', index) as string;
		const options = this.getNodeParameter('options', index, {}) as {
			file_name?: string;
			index?: string;
			timeout?: number;
		};

		// 使用 NodeUtils.buildUploadFileData 构建上传数据
		const file = await NodeUtils.buildUploadFileData.call(this, binaryPropertyName, index);

		if (!file || !file.value) {
			throw new NodeOperationError(
				this.getNode(),
				'未找到文件数据，请检查二进制文件字段名是否正确',
			);
		}

		// 检查文件大小
		const fileSize = file.value.length;
		if (fileSize > MAX_FILE_SIZE) {
			throw new NodeOperationError(
				this.getNode(),
				`文件大小 (${Math.round(fileSize / 1024 / 1024)}MB) 超过限制，附件最大支持100MB`,
			);
		}

		// 使用 options 中的文件名，如果没有则使用原始文件名
		const fileName = options.file_name?.trim() || file.options?.filename || 'file';

		// 构造 FormData
		const formData = new FormData();
		formData.append('file', file.value, {
			filename: fileName,
			contentType: file.options.contentType || 'application/octet-stream',
		});

		// 添加附件字段 key
		if (field_key?.trim()) {
			formData.append('field_key', field_key.trim());
		}

		// 如果提供了 index，添加到 formData
		if (options.index?.trim()) {
			formData.append('index', options.index.trim());
		}

		await RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/upload`,
			body: formData,
			timeout: options.timeout,
		} as IHttpRequestOptions);

		return {
			project_key: project_key,
			work_item_type_key: work_item_type_key,
			work_item_id: work_item_id
		}
	},
};

export default AttachmentUploadOperate;
