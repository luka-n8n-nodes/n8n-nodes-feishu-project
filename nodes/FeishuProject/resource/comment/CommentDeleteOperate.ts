import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const CommentDeleteOperate: ResourceOperations = {
	name: '删除评论',
	value: 'comment:delete',
	description: '只有创建评论的人才能删除评论，且删除评论只能通过 API 操作。',
	order: 40,
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
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const comment_id = this.getNodeParameter('comment_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		if (!comment_id) {
			throw new Error('评论 ID 不能为空');
		}

		const response = await RequestUtils.request.call(this, {
			method: 'POST',
			url: '/open_api/comment/delete',
			body: {
				project_key,
				comment_id,
			},
			timeout: options.timeout,
		}) as IDataObject;

		return {
			comment_id: (response?.comment_id as string) || comment_id,
		};
	},
};

export default CommentDeleteOperate;
