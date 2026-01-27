import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemInstanceSearchComplexOperate: ResourceOperations = {
	name: '获取指定的工作项列表（单空间-复杂传参）',
	value: 'work_item_instance_search:complex',
	order: 3,
	options: [
		{
			displayName: '项目Key',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '项目的唯一标识Key',
		},
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型的唯一标识Key',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"search_group": {
					"search_params": [],
					"conjunction": "",
					"search_groups": []
				},
				"page_num": 1,
				"page_size": 50,
				"fields": [],
				"expand": {
					// "need_workflow": true,
					// "relation_fields_detail": true,
					// "need_multi_text": true,
					// "need_user_detail": true,
					// "need_sub_task_parent": true
				}
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/1p8d7djs/568y2esm',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/search/params`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceSearchComplexOperate;
