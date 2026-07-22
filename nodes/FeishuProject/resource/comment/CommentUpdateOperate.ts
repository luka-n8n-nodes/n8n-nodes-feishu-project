import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const CommentUpdateOperate: ResourceOperations = {
	name: '更新评论',
	value: 'comment:update',
	description: '仅评论创建人可以更新该评论。附件类评论不支持更新。',
	order: 30,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '评论ID',
			name: 'comment_id',
			type: 'string',
			required: true,
			default: '',
			description: '评论 ID，可通过查询评论或创建评论接口获取',
		},
		{
			displayName: '内容类型',
			name: 'content_type',
			type: 'options',
			default: 'TEXT',
			required: true,
			description: '评论内容类型。附件类评论不支持更新',
			options: [
				{ name: '纯文本 (TEXT)', value: 'TEXT' },
				{ name: '富文本 (RICHTEXT)', value: 'RICHTEXT' },
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
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const comment_id = this.getNodeParameter('comment_id', index) as string;
		const content_type = this.getNodeParameter('content_type', index, 'TEXT') as string;
		const text = this.getNodeParameter('text', index, '') as string;
		const richTextParam = this.getNodeParameter('rich_text', index, '') as string;
		const markdown = this.getNodeParameter('markdown', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		if (!comment_id) {
			throw new Error('评论 ID 不能为空');
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
		}

		const response = await RequestUtils.request.call(this, {
			method: 'POST',
			url: '/open_api/comment/update',
			body: {
				project_key,
				comment_id,
				content,
			},
			timeout: options.timeout,
		}) as IDataObject;

		return {
			comment_id: (response?.comment_id as string) || comment_id,
		};
	},
};

export default CommentUpdateOperate;
