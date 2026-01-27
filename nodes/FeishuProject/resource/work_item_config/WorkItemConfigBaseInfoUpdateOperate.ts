import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemConfigBaseInfoUpdateOperate: ResourceOperations = {
	name: '更新工作项基础信息配置',
	value: 'work_item_config:base_info_update',
	order: 7,
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
				"description": "",
				"is_disabled": true,
				"is_pinned": true,
				"enable_schedule": true,
				"schedule_field_key": "",
				"estimate_point_field_key": "",
				"actual_work_time_field_key": "",
				"belong_role_keys": [""],
				"actual_work_time_switch": true
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
			method: 'PUT',
			url: `/open_api/${project_key}/work_item/type/${work_item_type_key}`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigBaseInfoUpdateOperate;
