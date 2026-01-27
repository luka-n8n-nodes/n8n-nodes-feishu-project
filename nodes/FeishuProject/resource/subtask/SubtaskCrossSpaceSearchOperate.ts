import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const SubtaskCrossSpaceSearchOperate: ResourceOperations = {
	name: '获取指定的子任务列表（跨空间）',
	value: 'subtask:cross_space_search',
	order: 30,
	options: [
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"page_size": 10,
				"page_num": 1,
				"name": "",
				"user_keys": [""],
				"status": 0,
				"created_at": {
					"start": 0,
					"end": 0
				},
				"simple_names": [""]
			}, null, 2),
			description: '完整的请求体参数，JSON格式',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/work_item/subtask/search`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default SubtaskCrossSpaceSearchOperate;
