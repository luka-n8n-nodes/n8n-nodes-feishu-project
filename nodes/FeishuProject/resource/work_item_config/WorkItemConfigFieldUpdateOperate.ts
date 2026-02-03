import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigFieldUpdateOperate: ResourceOperations = {
	name: '更新自定义字段',
	value: 'work_item_config:field_update',
	description: '该接口用于更新指定自定义字段的配置信息，对应的平台功能介绍详见<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/17mi85qv">字段配置</a>',
	order: 50,
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
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"field_name": "",
				"field_key": "",
				"field_value": "",
				"free_add": 0,
				"work_item_relation_uuid": "",
				"default_value": "",
				"field_alias": "",
				"help_description": "",
				"authorized_roles": [""],
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
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'PUT',
			url: `/open_api/${project_key}/field/${work_item_type_key}`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigFieldUpdateOperate;
