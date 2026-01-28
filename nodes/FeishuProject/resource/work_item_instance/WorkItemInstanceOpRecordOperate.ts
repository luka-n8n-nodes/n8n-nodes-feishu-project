import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceOpRecordOperate: ResourceOperations = {
	name: '获取工作项操作记录',
	value: 'work_item_instance:op_record',
	order: 80,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项IDs',
			name: 'work_item_ids',
			type: 'string',
			required: true,
			default: '',
			description: '工作项ID列表，多个用逗号分隔，也支持表达式数组',
		},
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: {
				minValue: 1,
			},
			displayOptions: {
				show: {
					returnAll: [false],
				},
			},
			description: 'Max number of results to return',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: 'Operator',
					name: 'operator',
					type: 'string',
					default: '',
					description: '操作人列表，多个用逗号分隔',
				},
				{
					displayName: 'Operator Type',
					name: 'operator_type',
					type: 'string',
					default: '',
					description: '操作人类型列表，多个用逗号分隔',
				},
				{
					displayName: 'Source Type',
					name: 'source_type',
					type: 'string',
					default: '',
					description: '来源类型列表，多个用逗号分隔',
				},
				{
					displayName: 'Source',
					name: 'source',
					type: 'string',
					default: '',
					description: '来源列表，多个用逗号分隔',
				},
				{
					displayName: 'Operation Type',
					name: 'operation_type',
					type: 'string',
					default: '',
					description: '操作类型列表，多个用逗号分隔',
				},
				{
					displayName: 'Start Time',
					name: 'start',
					type: 'dateTime',
					default: '',
					description: '操作时间起始',
				},
				{
					displayName: 'End Time',
					name: 'end',
					type: 'dateTime',
					default: '',
					description: '操作时间截止',
				},
				{
					displayName: 'Op Record Module',
					name: 'op_record_module',
					type: 'string',
					default: '',
					description: '操作记录模块列表，多个用逗号分隔',
				},
				{
					displayName: 'Timeout',
					name: 'timeout',
					type: 'number',
					default: 10000,
					description: '请求超时时间（毫秒）',
				},
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const workItemIdsRaw = this.getNodeParameter('work_item_ids', index) as string | string[] | number[];
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 辅助函数：将日期时间值转换为毫秒时间戳
		const toTimestamp = (value: string | number | undefined): number | undefined => {
			if (value === undefined || value === '' || value === null) return undefined;
			if (typeof value === 'number') return value;
			if (/^\d+$/.test(value)) return parseInt(value, 10);
			const date = new Date(value);
			if (!isNaN(date.getTime())) return date.getTime();
			return undefined;
		};

		// 解析工作项ID列表，转换为数字数组（兼容表达式数组和逗号分隔字符串）
		let workItemIds: number[];
		if (Array.isArray(workItemIdsRaw)) {
			workItemIds = workItemIdsRaw
				.map((id) => typeof id === 'number' ? id : parseInt(String(id).trim(), 10))
				.filter((id) => !isNaN(id));
		} else {
			workItemIds = workItemIdsRaw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
		}

		// 构建基础请求体
		const baseBody: IDataObject = {
			project_key: project_key,
			work_item_ids: workItemIds,
		};

		// 处理可选参数
		if (options.operator) {
			baseBody.operator = (options.operator as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.operator_type) {
			baseBody.operator_type = (options.operator_type as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.source_type) {
			baseBody.source_type = (options.source_type as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.source) {
			baseBody.source = (options.source as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.operation_type) {
			baseBody.operation_type = (options.operation_type as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.op_record_module) {
			baseBody.op_record_module = (options.op_record_module as string).split(',').map(s => s.trim()).filter(s => s);
		}

		const startTs = toTimestamp(options.start as string | number);
		const endTs = toTimestamp(options.end as string | number);
		if (startTs !== undefined) baseBody.start = startTs;
		if (endTs !== undefined) baseBody.end = endTs;

		// 统一的请求函数（使用游标分页）
		const fetchPage = async (startFrom: string, pageSize: number) => {
			const body: IDataObject = {
				...baseBody,
				page_size: pageSize,
			};
			if (startFrom) {
				body.start_from = startFrom;
			}

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: `/open_api/op_record/work_item/list`,
				body: body,
				timeout: options.timeout as number | undefined,
			}) as any;

			return {
				data: response?.data || [],
				hasMore: response?.has_more || false,
				nextStartFrom: response?.start_from || '',
			};
		};

		// 处理分页逻辑（使用游标分页）
		if (returnAll) {
			let allResults: any[] = [];
			let startFrom = '';
			const pageSize = 50;
			let pageCount = 0;

			while (true) {
				const { data, hasMore, nextStartFrom } = await fetchPage(startFrom, pageSize);
				allResults = allResults.concat(data);
				pageCount++;

				// 检查是否还有更多数据
				if (!hasMore || data.length === 0 || pageCount >= 1000) {
					if (pageCount >= 1000) {
						this.logger.warn('已达到最大分页数限制(1000页)，停止获取');
					}
					break;
				}

				startFrom = nextStartFrom;
			}

			return allResults;
		} else {
			// 单次请求，返回限制数量的数据
			const pageSize = Math.min(limit, 50);
			const { data } = await fetchPage('', pageSize);
			return data.slice(0, limit);
		}
	}
};

export default WorkItemInstanceOpRecordOperate;
