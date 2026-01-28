import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const SubtaskUpdateOperate: ResourceOperations = {
	name: '更新子任务',
	value: 'subtask:update',
	order: 40,
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
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: '节点ID',
			name: 'node_id',
			type: 'string',
			required: true,
			default: '',
			description: '节点的唯一标识ID',
		},
		{
			displayName: '任务ID',
			name: 'task_id',
			type: 'string',
			required: true,
			default: '',
			description: '任务的唯一标识ID',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"name": "",
				"assignee": [""],
				"role_assignee": [
					{
						"role": "",
						"name": "",
						"owners": [""],
						"exist": true
					}
				],
				"schedule": {
					"points": 0,
					"estimate_start_date": 1724169600000,
					"estimate_end_date": 1724428799999,
					"owners": [""],
					"actual_work_time": 0,
					"is_auto": true
				},
				"note": "",
				"deliverable": [
					{
						"field_key": "",
						"field_value": "",
						"target_state": {
							"state_key": "",
							"transition_id": 0
						},
						"field_type_key": "",
						"field_alias": "",
						"help_description": ""
					}
				],
				"update_fields": [
					{
						"field_key": "",
						"field_value": "",
						"target_state": {
							"state_key": "",
							"transition_id": 0
						},
						"field_type_key": "",
						"field_alias": "",
						"help_description": ""
					}
				]
			}, null, 2),
			description: '完整的请求体参数，JSON格式。详见：<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/5xugnkcg">子任务更新与属性解析格式</a>',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const node_id = this.getNodeParameter('node_id', index) as string;
		const task_id = this.getNodeParameter('task_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/workflow/${node_id}/task/${task_id}`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default SubtaskUpdateOperate;
