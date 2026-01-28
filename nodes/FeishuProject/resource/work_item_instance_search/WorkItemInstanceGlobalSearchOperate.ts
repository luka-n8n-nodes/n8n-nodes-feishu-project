import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceGlobalSearchOperate: ResourceOperations = {
	name: '获取指定的工作项列表（全局搜索）',
	value: 'work_item_instance_search:global',
	order: 5,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Query Type',
			name: 'query_type',
			type: 'options',
			default: 'workitem',
			required: true,
			options: [
				{
					name: '工作项',
					value: 'workitem',
				},
				{
					name: '视图',
					value: 'view',
				},
			],
			description: '查询类型，可选值为工作项和视图',
		},
		{
			displayName: 'Query',
			name: 'query',
			type: 'string',
			default: '',
			required: true,
			description: '查询内容',
		},
		{
			displayName: 'Query Sub Type',
			name: 'query_sub_type',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					query_type: ['workitem'],
				},
			},
			description: '指定工作项类型列表，用于筛选查询结果。多个用逗号分隔。当 query_type 为 workitem 时生效。',
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
		const queryType = this.getNodeParameter('query_type', index) as string;
		const query = this.getNodeParameter('query', index) as string;
		const querySubTypeStr = this.getNodeParameter('query_sub_type', index, '') as string;
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 构建基础请求体
		const baseBody: IDataObject = {
			query_type: queryType,
			query: query,
		};

		// 添加可选的 project_keys
		if (project_key) {
			baseBody.project_keys = [project_key];
		}

		// 添加可选的 query_sub_type（当 query_type 为 workitem 时）
		if (querySubTypeStr && queryType === 'workitem') {
			baseBody.query_sub_type = querySubTypeStr.split(',').map(s => s.trim()).filter(s => s);
		}

		// 统一的请求函数
		const fetchPage = async (pageNum: number, pageSize: number) => {
			const body = {
				...baseBody,
				page_num: pageNum,
				page_size: pageSize,
			};

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: `/open_api/compositive_search`,
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

export default WorkItemInstanceGlobalSearchOperate;
