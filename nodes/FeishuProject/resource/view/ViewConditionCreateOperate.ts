import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const ViewConditionCreateOperate: ResourceOperations = {
	name: '创建条件视图',
	value: 'view:condition_create',
	options: [
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"project_key": "",
				"work_item_type_key": "",
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
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/view/v1/create_condition_view`,
			body: body,
		});
	}
};

export default ViewConditionCreateOperate;
