import { IDataObject, IExecuteFunctions, IHttpRequestOptions, NodeOperationError } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { batchingOption, timeoutOption } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';
import FormData from 'form-data';

/**
 * 文件上传最大大小限制 (20MB)
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const FileStreamUploadFormOperate: ResourceOperations = {
	name: '上传文件',
	value: 'file:uploadForm',
	order: 10,
	description:
		'上传一个小于 20MB 的文件，上传后需再绑定到评论等业务中。未绑定业务点位前不能下载，超过 7 天未绑定会自动删除。',
	options: [
		{
			displayName:
				'该接口用于上传一个小于 20MB 的文件。<br><br>上传完成的文件需要再绑定到评论等业务中，在未绑定到业务点位之前不能下载，超过 7 天未绑定业务点位会自动删除文件（如果是一个附件，会占用容量，在删除时会解除容量占用）。<br><br><b>注意事项</b><br>遇到浏览器无法展示附件预览的情况，需检查上传时的文件 MimeType 设置，填写与文件类型匹配的 MimeType。如 jpeg 格式图片：image/jpeg，mp4 格式音频：audio/mp4，mp4 格式视频：video/mp4 等。',
			name: 'uploadFormNotice',
			type: 'notice',
			default: '',
		},
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '资源类型',
			name: 'resource_type',
			type: 'options',
			default: 'CommentAttachment',
			required: true,
			description: '文件所属的业务资源类型',
			options: [
				{
					name: '评论的附件 (CommentAttachment)',
					value: 'CommentAttachment',
				},
				{
					name: '评论富文本中的图片 (CommentMultiTextImg)',
					value: 'CommentMultiTextImg',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description:
				'包含要上传文件的二进制数据字段名，对应 form 表单 file 字段，单文件不支持多文件同时上传，文件最大支持 20MB。若无法预览附件，请确保二进制数据的 MimeType 与文件类型匹配（如 image/jpeg、audio/mp4、video/mp4）。',
		},
		{
			displayName: '工作项类型 Name or ID',
			name: 'work_item_type_key',
			type: 'options',
			default: '',
			required: true,
			description:
				'空间下工作项类型，需要先选择空间，详见：<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/3pjp854w">获取空间下工作项类型</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
					displayName: '业务类型',
					name: 'comment_biz_type',
					type: 'string',
					default: 'WORKITEM',
					description: 'JSON field_map 中的 comment_biz_type，一般写死为 WORKITEM',
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
		const resource_type = this.getNodeParameter('resource_type', index) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as {
			file_name?: string;
			comment_biz_type?: string;
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

		// 检查文件大小（该接口最大支持 20MB）
		const fileSize = file.value.length;
		if (fileSize > MAX_FILE_SIZE) {
			throw new NodeOperationError(
				this.getNode(),
				`文件大小 (${Math.round(fileSize / 1024 / 1024)}MB) 超过限制，该接口最大支持 20MB`,
			);
		}

		// 使用 options 中的文件名，如果没有则使用原始文件名
		const fileName = options.file_name?.trim() || file.options?.filename || 'file';

		// 构造 field_map
		const fieldMap: IDataObject = {
			comment_biz_type: options.comment_biz_type?.trim() || 'WORKITEM',
			work_item_type_key,
			work_item_id,
		};

		// 构造 FormData
		const formData = new FormData();
		formData.append('file', file.value, {
			filename: fileName,
			contentType: file.options.contentType || 'application/octet-stream',
		});
		formData.append('field_map', JSON.stringify(fieldMap));

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/file/stream/resource/${resource_type}/upload_form`,
			body: formData,
			headers: formData.getHeaders(),
			timeout: options.timeout,
		} as IHttpRequestOptions);
	},
};

export default FileStreamUploadFormOperate;
