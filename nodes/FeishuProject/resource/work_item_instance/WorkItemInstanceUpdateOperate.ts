import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceUpdateOperate: ResourceOperations = {
	name: '更新工作项',
	value: 'work_item_instance:update',
	order: 30,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型的唯一标识Key',
		},
		{
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项的唯一标识ID',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
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
			description: '完整的请求体参数，JSON格式',
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
			method: 'PUT',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceUpdateOperate;
