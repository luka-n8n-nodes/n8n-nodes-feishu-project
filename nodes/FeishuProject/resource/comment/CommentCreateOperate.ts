import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const CommentCreateOperate: ResourceOperations = {
	name: '添加评论',
	value: 'comment:create',
	order: 20,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '评论对象类型',
			name: 'object_type',
			type: 'options',
			default: 'WORKITEM',
			required: true,
			description: '评论对象类型。WORKITEM 为工作项添加评论；WORKITEMFIELD 为工作项字段添加评论；CHILDCOMMENT 为子评论',
			options: [
				{
					name: '工作项 (WORKITEM)',
					value: 'WORKITEM',
					description: '需要 work_item_type_key 和 work_item_id',
				},
				{
					name: '工作项字段 (WORKITEMFIELD)',
					value: 'WORKITEMFIELD',
					description: '需要 work_item_type_key、work_item_id 和 field_key',
				},
				{
					name: '子评论 (CHILDCOMMENT)',
					value: 'CHILDCOMMENT',
					description: '需要 parent_id',
				},
			],
		},
		{
			displayName: '工作项类型 Name or ID',
			name: 'work_item_type_key',
			type: 'options',
			default: '',
			required: true,
			description: '空间下工作项类型，需要先选择空间，详见：<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/3pjp854w">获取空间下工作项类型</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemTypes',
			},
			displayOptions: {
				show: {
					object_type: ['WORKITEM', 'WORKITEMFIELD'],
				},
			},
		},
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
			displayOptions: {
				show: {
					object_type: ['WORKITEM', 'WORKITEMFIELD'],
				},
			},
		},
		{
			displayName: '字段 Key Name or ID',
			name: 'field_key',
			type: 'options',
			default: '',
			required: true,
			description: '字段 key，需与工作项类型中的字段保持一致。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemFieldsAll',
			},
			displayOptions: {
				show: {
					object_type: ['WORKITEMFIELD'],
				},
			},
		},
		{
			displayName: '父评论ID',
			name: 'parent_id',
			type: 'string',
			required: true,
			default: '',
			description: '父评论 ID，可通过查询评论或创建评论接口获取。指同一实例下的一级评论 ID，不可使用二级评论 ID。',
			displayOptions: {
				show: {
					object_type: ['CHILDCOMMENT'],
				},
			},
		},
		{
			displayName: '内容类型',
			name: 'content_type',
			type: 'options',
			default: 'TEXT',
			required: true,
			description: '评论内容类型',
			options: [
				{ name: '纯文本 (TEXT)', value: 'TEXT' },
				{ name: '富文本 (RICHTEXT)', value: 'RICHTEXT' },
				{ name: '附件 (FILE)', value: 'FILE' },
			],
		},
		{
			displayName: '评论内容（纯文本）',
			name: 'text',
			type: 'string',
			default: '',
			required: true,
			description: '纯文本评论内容',
			displayOptions: {
				show: {
					content_type: ['TEXT'],
				},
			},
		},
		{
			displayName: '评论内容（富文本）',
			name: 'rich_text',
			type: 'json',
			default: JSON.stringify([], null, 2),
			description: '富文本评论内容，JSON 格式。与 Markdown 参数二选一，若两者都提供则 rich_text 优先。富文本格式详见：https://project.feishu.cn/b/helpcenter/1p8d7djs/1tj6ggll#110a33af',
			displayOptions: {
				show: {
					content_type: ['RICHTEXT'],
				},
			},
		},
		{
			displayName: '评论内容（Markdown）',
			name: 'markdown',
			type: 'string',
			default: '',
			description: 'Markdown 格式的富文本评论内容。与 rich_text 参数二选一，若两者都提供则 rich_text 优先',
			displayOptions: {
				show: {
					content_type: ['RICHTEXT'],
				},
			},
		},
		{
			displayName: '附件 Token',
			name: 'file_token',
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
			type: 'string',
			required: true,
			default: '',
			description: '附件 token，通过文件上传接口获取',
			displayOptions: {
				show: {
					content_type: ['FILE'],
				},
			},
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const object_type = this.getNodeParameter('object_type', index, 'WORKITEM') as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index, '') as string;
		const work_item_id = this.getNodeParameter('work_item_id', index, '') as string;
		const field_key = this.getNodeParameter('field_key', index, '') as string;
		const parent_id = this.getNodeParameter('parent_id', index, '') as string;
		const content_type = this.getNodeParameter('content_type', index, 'TEXT') as string;
		const text = this.getNodeParameter('text', index, '') as string;
		const richTextParam = this.getNodeParameter('rich_text', index, '') as string;
		const markdown = this.getNodeParameter('markdown', index, '') as string;
		const file_token = this.getNodeParameter('file_token', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const object: IDataObject = { type: object_type };

		if (object_type === 'CHILDCOMMENT') {
			if (!parent_id) {
				throw new Error('添加子评论时必须填写 parent_id');
			}
			object.parent_id = parent_id;
		} else {
			if (!work_item_type_key || !work_item_id) {
				throw new Error('添加工作项评论时必须填写 work_item_type_key 和 work_item_id');
			}
			object.work_item_type_key = work_item_type_key;
			object.work_item_id = work_item_id;
			if (object_type === 'WORKITEMFIELD') {
				if (!field_key) {
					throw new Error('添加工作项字段评论时必须填写 field_key');
				}
				object.field_key = field_key;
			}
		}

		const content: IDataObject = { type: content_type };

		if (content_type === 'TEXT') {
			if (!text || !text.trim()) {
				throw new Error('纯文本评论内容不能为空');
			}
			content.text = text.trim();
		} else if (content_type === 'RICHTEXT') {
			let richText: unknown = null;
			if (richTextParam && richTextParam.trim()) {
				richText = NodeUtils.parseJsonParameter(richTextParam, '评论内容（富文本）');
			}

			const hasRichText = richText && (
				Array.isArray(richText) ? richText.length > 0 :
				(typeof richText === 'object' && richText !== null && Object.keys(richText).length > 0)
			);

			if (hasRichText) {
				content.rich_text = richText as IDataObject | IDataObject[];
			} else if (markdown && markdown.trim()) {
				content.markdown = markdown.trim();
			} else {
				throw new Error('富文本评论内容不能为空，请填写 rich_text 或 markdown');
			}
		} else if (content_type === 'FILE') {
			if (!file_token || !file_token.trim()) {
				throw new Error('附件评论必须填写 file_token');
			}
			content.file_token = file_token.trim();
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: '/open_api/comment/create',
			body: {
				project_key,
				object,
				content,
			},
			timeout: options.timeout,
		});
	},
};

export default CommentCreateOperate;
