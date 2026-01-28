import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceReviewConclusionQueryOperate: ResourceOperations = {
	name: '评审结论标签值查询',
	value: 'work_item_instance:review_conclusion_query',
	order: 100,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"work_item_id": 0,
				"node_ids": [""]
			}, null, 2),
			description: '完整的请求体参数，JSON格式',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		// 将 project_key 合并到 body 中
		body.project_key = project_key;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/work_item/finished/query_conclusion_option`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceReviewConclusionQueryOperate;
