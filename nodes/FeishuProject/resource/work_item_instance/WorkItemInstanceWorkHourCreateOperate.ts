import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceWorkHourCreateOperate: ResourceOperations = {
	name: '创建实际工时',
	value: 'work_item_instance:work_hour_create',
	order: 130,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型的唯一标识Key',
		},
		{
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项的唯一标识ID',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"work_begin_date": 1724051666000,
				"work_end_date": 1724342400000,
				"include_holidays": true,
				"working_hour_records": [
					{
						"resource_type": "",
						"resource_id": "",
						"work_time": "",
						"work_description": ""
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
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/work_hour_record`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceWorkHourCreateOperate;
