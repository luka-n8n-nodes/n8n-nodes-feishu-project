import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemConfigRelationUpdateOperate: ResourceOperations = {
	name: '更新工作项关系',
	value: 'work_item_config:relation_update',
	order: 4,
	options: [
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"relation_id": "",
				"project_key": "",
				"work_item_type_key": "",
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
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/work_item/relation/update`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigRelationUpdateOperate;
