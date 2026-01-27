import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

/**
 * 文件上传最大大小限制 (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const AttachmentUploadOperate: ResourceOperations = {
	name: '添加附件',
	value: 'attachment:upload',
	order: 10,
	options: [
		{
			displayName: '空间ID',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description:
				'空间 ID (project_key) 或空间域名 (simple_name)。project_key 在飞书项目空间双击空间名称获取；simple_name 一般在飞书项目空间 URL 中获取，例如空间 URL为"https://project.feishu.cn/doc/overview"，则 simple_name 为"doc"',
		},
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型，系统自动生成，可通过获取空间下工作项类型接口获取',
		},
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角"..." > ID获取',
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
			displayName: '字段Key',
			name: 'field_key',
			type: 'string',
			default: '',
			description:
				'上传附件字段的唯一标识，用于指定附件上传的目标字段。与 field_alias 参数二选一传入即可',
		},
		{
			displayName: '字段别名',
			name: 'field_alias',
			type: 'string',
			default: '',
			description:
				'上传附件字段的对接标识，用于指定附件上传的目标字段。与 field_key 参数二选一传入即可',
		},
		{
			displayName: '数组下标',
			name: 'index',
			type: 'string',
			default: '',
			description: '复合字段适用，用于指定数组下标',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const field_key = this.getNodeParameter('field_key', index) as string;
		const field_alias = this.getNodeParameter('field_alias', index) as string;
		const indexParam = this.getNodeParameter('index', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

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

		// 构造 FormData
		const formData: IDataObject = {
			file: {
				value: file.value,
				options: {
					filename: file.options.filename || 'file',
					contentType: file.options.contentType || 'application/octet-stream',
				},
			},
		};

		// field_key 和 field_alias 二选一，优先使用 field_key
		if (field_key?.trim()) {
			formData.field_key = field_key.trim();
		} else if (field_alias?.trim()) {
			formData.field_alias = field_alias.trim();
		}

		// 如果提供了 index，添加到 formData
		if (indexParam?.trim()) {
			formData.index = indexParam.trim();
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/upload`,
			body: formData,
			timeout: options.timeout,
		});
	},
};

export default AttachmentUploadOperate;
