import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const CommentQueryOperate: ResourceOperations = {
	name: '查询评论',
	value: 'comment:query',
	order: 20,
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
			displayName: '分页页码',
			name: 'page_num',
			type: 'number',
			default: 1,
			description: '分页页码，从1开始计数，默认值为1',
		},
		{
			displayName: '每页条数',
			name: 'page_size',
			type: 'number',
			default: 10,
			description: '每页返回的数据条数，最大支持200条',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const page_num = this.getNodeParameter('page_num', index, 1) as number;
		const page_size = this.getNodeParameter('page_size', index, 10) as number;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const qs: IDataObject = {};

		// 如果提供了 page_num，添加到查询参数
		if (page_num !== undefined && page_num > 0) {
			qs.page_num = page_num;
		}

		// 如果提供了 page_size，添加到查询参数
		if (page_size !== undefined && page_size > 0) {
			qs.page_size = page_size;
		}

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/comments`,
			qs: qs,
			timeout: options.timeout,
		});
	}
};

export default CommentQueryOperate;
