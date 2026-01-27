import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const CommentCreateOperate: ResourceOperations = {
	name: '添加评论',
	value: 'comment:create',
	order: 10,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型，可通过获取空间下工作项类型接口获取',
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
			displayName: '评论内容（纯文本）',
			name: 'content',
			type: 'string',
			default: '',
			description: '评论内容，仅支持纯文本。与 rich_text 参数二选一传入即可，但两者不能同时为空。如果两者都提供，rich_text 优先',
		},
		{
			displayName: '评论内容（富文本）',
			name: 'rich_text',
			type: 'json',
			default: JSON.stringify([], null, 2),
			description: '支持富文本格式的评论内容，JSON格式。与 content 参数二选一传入即可，但两者不能同时为空。如果两者都提供，rich_text 优先。富文本格式详见：https://project.feishu.cn/b/helpcenter/1p8d7djs/1tj6ggll#110a33af',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const content = this.getNodeParameter('content', index) as string;
		const richTextParam = this.getNodeParameter('rich_text', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {};

		// 处理 rich_text
		let richText: any = null;
		if (richTextParam && richTextParam.trim()) {
			richText = NodeUtils.parseJsonParameter(richTextParam, '评论内容（富文本）');
		}

		// content 和 rich_text 互斥（二选一），但都不能完全为空
		// 如果两者都提供，rich_text 优先
		const hasRichText = richText && (
			Array.isArray(richText) ? richText.length > 0 :
			(typeof richText === 'object' && richText !== null && Object.keys(richText).length > 0)
		);

		if (hasRichText) {
			body.rich_text = richText;
		} else if (content && content.trim()) {
			body.content = content.trim();
		} else {
			throw new Error('content 和 rich_text 参数不能同时为空，请至少填写其中一个');
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/comment/create`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default CommentCreateOperate;
