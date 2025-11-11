import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const WorkItemInstanceSearchCrossSpaceOperate: ResourceOperations = {
	name: '获取指定的工作项列表（跨空间）',
	value: 'work_item_instance_search:cross_space',
	options: [
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"search_user": {
					"user_keys": [],
					"field_key": "",
					"role": ""
				},
				"work_item_type_key": "",
				// "created_at": {
				// 	"start": 0,
				// 	"end": 0
				// },
				// "updated_at": {
				// 	"start": 0,
				// 	"end": 0
				// },
				"work_item_status": [
					// {
					// 	"state_key": "",
					// 	"is_archived_state": true,
					// 	"is_init_state": true,
					// 	"updated_at": 1654063482000,
					// 	"updated_by": "",
					// 	"history": [{}]
					// }
				],
				"work_item_name": "",
				"page_num": 1,
				"page_size": 50,
				// "tenant_group_id": 0,
				"work_item_ids": [],
				"businesses": [],
				"priorities": [],
				"tags": [],
				"simple_names": [],
				"template_ids": [],
				"expand": {
					// "need_workflow": true,
					// "relation_fields_detail": true,
					// "need_multi_text": true,
					// "need_user_detail": true,
					// "need_sub_task_parent": true
				}
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/1p8d7djs/568y2esm',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const bodyParam = this.getNodeParameter('body', index) as string;

		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/work_items/filter_across_project`,
			body: body,
		});
	}
};

export default WorkItemInstanceSearchCrossSpaceOperate;
