import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemInstanceWorkHourRecordsOperate: ResourceOperations = {
	name: '获取工作项的工时记录列表',
	value: 'work_item_instance:work_hour_records',
	order: 150,
	options: [
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"project_key": "",
				"work_item_type_key": "",
				"work_item_id": 0,
				"page_num": 1,
				"page_size": 10
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
			url: `/open_api/work_item/man_hour/records`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceWorkHourRecordsOperate;
