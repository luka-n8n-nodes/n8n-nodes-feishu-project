import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigBaseInfoUpdateOperate: ResourceOperations = {
	name: '更新工作项基础信息配置',
	value: 'work_item_config:base_info_update',
	description: '该接口用于更新指定工作项类型的基础信息配置，对应的平台功能介绍详见<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/2rv0xerq">基本信息配置</a>和<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/3t60v7vo">基本信息页配置</a>',
	order: 20,
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
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
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
