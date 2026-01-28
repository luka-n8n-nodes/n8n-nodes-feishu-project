import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceWorkHourRecordsOperate: ResourceOperations = {
	name: '获取工作项的工时记录列表',
	value: 'work_item_instance:work_hour_records',
	order: 150,
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
			type: 'number',
			required: true,
			default: 0,
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
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
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as number;
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 统一的请求函数
		const fetchPage = async (pageNum: number, pageSize: number) => {
			const body: IDataObject = {
				project_key: project_key,
				work_item_type_key: work_item_type_key,
				work_item_id: work_item_id,
				page_num: pageNum,
				page_size: pageSize,
			};

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: `/open_api/work_item/man_hour/records`,
				body: body,
				timeout: options.timeout as number | undefined,
			}) as any;

			return {
				data: response?.data || [],
				total: response?.pagination?.total || 0,
			};
		};

		// 处理分页逻辑
		if (returnAll) {
			let allResults: any[] = [];
			let pageNum = 1;
			const pageSize = 50;

			while (true) {
				const { data, total } = await fetchPage(pageNum, pageSize);
				allResults = allResults.concat(data);

				// 检查是否还有更多数据
				if (allResults.length >= total || data.length === 0 || pageNum >= 1000) {
					if (pageNum >= 1000) {
						this.logger.warn('已达到最大分页数限制(1000页)，停止获取');
					}
					break;
				}

				pageNum++;
			}

			return allResults;
		} else {
			// 单次请求，返回限制数量的数据
			const pageSize = Math.min(limit, 50);
			const { data } = await fetchPage(1, pageSize);
			return data.slice(0, limit);
		}
	}
};

export default WorkItemInstanceWorkHourRecordsOperate;
