import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const ViewListOperate: ResourceOperations = {
	name: '获取视图列表及配置信息',
	value: 'view:list',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
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
					displayName: 'Work Item Type Name or ID',
					name: 'work_item_type_key',
					type: 'options',
					default: '',
					description: '选择工作项类型。需要先选择空间。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					typeOptions: {
						loadOptionsMethod: 'loadWorkItemTypes',
					},
				},
				{
					displayName: 'View IDs',
					name: 'view_ids',
					type: 'string',
					default: '',
					description: '视图ID列表，多个用逗号分隔',
				},
				{
					displayName: 'Created By',
					name: 'created_by',
					type: 'string',
					default: '',
					description: '创建人',
				},
				{
					displayName: 'Created At Start',
					name: 'created_at_start',
					type: 'dateTime',
					default: '',
					description: '创建时间起始',
				},
				{
					displayName: 'Created At End',
					name: 'created_at_end',
					type: 'dateTime',
					default: '',
					description: '创建时间截止',
				},
				{
					displayName: 'View Name',
					name: 'view_name',
					type: 'string',
					default: '',
					description: '视图名称（支持模糊搜索）',
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

		// 构建基础请求体
		const baseBody: IDataObject = {};

		if (options.work_item_type_key) {
			baseBody.work_item_type_key = options.work_item_type_key;
		}
		if (options.view_ids) {
			baseBody.view_ids = (options.view_ids as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.created_by) {
			baseBody.created_by = options.created_by;
		}
		if (options.view_name) {
			baseBody.view_name = options.view_name;
		}

		// 创建时间过滤
		if (options.created_at_start || options.created_at_end) {
			const createdAt: IDataObject = {};
			const startTs = toTimestamp(options.created_at_start as string | number);
			const endTs = toTimestamp(options.created_at_end as string | number);
			if (startTs !== undefined) createdAt.start = startTs;
			if (endTs !== undefined) createdAt.end = endTs;
			if (Object.keys(createdAt).length > 0) baseBody.created_at = createdAt;
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
				url: `/open_api/${project_key}/view_conf/list`,
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

export default ViewListOperate;
