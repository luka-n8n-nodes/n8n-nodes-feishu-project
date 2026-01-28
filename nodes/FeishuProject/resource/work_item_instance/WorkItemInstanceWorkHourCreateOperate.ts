import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceWorkHourCreateOperate: ResourceOperations = {
	name: '新增工时登记记录',
	value: 'work_item_instance:work_hour_create',
	order: 130,
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
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: '工作开始日期',
			name: 'work_begin_date',
			type: 'dateTime',
			required: true,
			default: '',
			description: '工作开始日期，支持日期选择器或表达式传入毫秒时间戳',
		},
		{
			displayName: '工作结束日期',
			name: 'work_end_date',
			type: 'dateTime',
			required: true,
			default: '',
			description: '工作结束日期，支持日期选择器或表达式传入毫秒时间戳',
		},
		{
			displayName: '包含节假日',
			name: 'include_holidays',
			type: 'boolean',
			default: true,
			description: 'Whether to include holidays in the work hour record',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
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
		const work_begin_date_raw = this.getNodeParameter('work_begin_date', index) as string | number;
		const work_end_date_raw = this.getNodeParameter('work_end_date', index) as string | number;
		const include_holidays = this.getNodeParameter('include_holidays', index) as boolean;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		// 转换日期为毫秒时间戳
		const toTimestamp = (value: string | number): number => {
			if (typeof value === 'number') return value;
			if (/^\d+$/.test(value)) return parseInt(value, 10);
			return new Date(value).getTime();
		};

		body.work_begin_date = toTimestamp(work_begin_date_raw);
		body.work_end_date = toTimestamp(work_end_date_raw);
		body.include_holidays = include_holidays;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/work_hour_record`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceWorkHourCreateOperate;
