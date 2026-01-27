import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemConfigFieldCreateOperate: ResourceOperations = {
	name: '创建自定义字段',
	value: 'work_item_config:field_create',
	order: 8,
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
				"field_name": "",
				"field_type_key": "",
				"value_type": 0,
				"reference_work_item_type_key": "",
				"reference_field_key": "",
				"field_value": "",
				"free_add": 0,
				"work_item_relation_uuid": "",
				"default_value": "",
				"field_alias": "",
				"help_description": "",
				"authorized_roles": [""],
				"is_multi": true,
				"format": true,
				"related_field_extra_display_infos": [
					{
						"project_key": "",
						"work_item_type_key": "",
						"display_field_keys": [""],
						"display_role_keys": [""],
						"display_controls": [""]
					}
				]
			}, null, 2),
			description: '完整的请求体参数，JSON格式',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/field/${work_item_type_key}/create`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigFieldCreateOperate;
