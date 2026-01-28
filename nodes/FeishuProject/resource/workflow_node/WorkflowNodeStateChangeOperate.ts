import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkflowNodeStateChangeOperate: ResourceOperations = {
	name: '状态流转',
	value: 'workflow_node:state_change',
	order: 4,
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
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				// "transition_id": 0,
				"fields": [
					// {
					// 	"field_key": "",
					// 	"field_value": "",
					// 	"target_state": {
					// 		"state_key": "",
					// 		"transition_id": 0
					// 	},
					// 	"field_type_key": "",
					// 	"field_alias": "",
					// 	"help_description": ""
					// }
				],
				"role_owners": [
					// {
					// 	"role": "",
					// 	"name": "",
					// 	"owners": [""],
					// 	"exist": true
					// }
				]
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/5fivh4k0',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/workflow/${work_item_type_key}/${work_item_id}/node/state_change`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkflowNodeStateChangeOperate;
