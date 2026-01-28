import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const ViewConditionCreateOperate: ResourceOperations = {
	name: '创建条件视图',
	value: 'view:condition_create',
	order: 5,
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
				"search_group": {
					"search_params": [
						{
							"param_key": "",
							"value": "",
							"operator": ""
						}
					],
					"conjunction": "",
					"search_groups": [{}]
				},
				"cooperation_mode": 0,
				"cooperation_user_keys": [""],
				"cooperation_team_ids": [0],
				"name": ""
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/1p8d7djs/568y2esm',
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

		// 将 project_key 和 work_item_type_key 合并到 body 中
		body.project_key = project_key;
		body.work_item_type_key = work_item_type_key;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/view/v1/create_condition_view`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default ViewConditionCreateOperate;
