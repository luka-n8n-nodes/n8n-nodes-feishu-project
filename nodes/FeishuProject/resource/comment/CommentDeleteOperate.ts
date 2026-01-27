import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const CommentDeleteOperate: ResourceOperations = {
	name: '删除评论',
	value: 'comment:delete',
	order: 40,
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
			description: '工作项类型 key，在获取空间下工作项类型接口获取',
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
			displayName: '评论ID',
			name: 'comment_id',
			type: 'string',
			required: true,
			default: '',
			description: '评论 ID，可以通过查询评论接口获取',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const comment_id = this.getNodeParameter('comment_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'DELETE',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/comment/${comment_id}`,
			timeout: options.timeout,
		});
	}
};

export default CommentDeleteOperate;
