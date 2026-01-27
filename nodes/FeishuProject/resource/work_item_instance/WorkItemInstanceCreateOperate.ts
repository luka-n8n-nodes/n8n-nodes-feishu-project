import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemInstanceCreateOperate: ResourceOperations = {
	name: '创建工作项',
	value: 'work_item_instance:create',
	order: 20,
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
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"work_item_type_key": "",
				"field_value_pairs": [
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
				"template_id": 0,
				"name": ""
			}, null, 2),
			description: '完整的请求体参数，JSON格式',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/create`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceCreateOperate;
