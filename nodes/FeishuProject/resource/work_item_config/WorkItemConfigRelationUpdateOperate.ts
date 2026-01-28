import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigRelationUpdateOperate: ResourceOperations = {
	name: '更新工作项关系',
	value: 'work_item_config:relation_update',
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
			displayName: '关系ID',
			name: 'relation_id',
			type: 'string',
			default: '',
			required: true,
			description: '工作项关系的唯一标识ID',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"name": "",
				"relation_details": [
					{
						"work_item_type_key": "",
						"work_item_type_name": "",
						"project_key": "",
						"project_name": ""
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
		const relation_id = this.getNodeParameter('relation_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		// 合并动态参数到请求体
		body.project_key = project_key;
		body.work_item_type_key = work_item_type_key;
		body.relation_id = relation_id;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/work_item/relation/update`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigRelationUpdateOperate;
