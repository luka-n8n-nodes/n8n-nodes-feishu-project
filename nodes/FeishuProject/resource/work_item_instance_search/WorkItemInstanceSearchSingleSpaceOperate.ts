import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceSearchSingleSpaceOperate: ResourceOperations = {
	name: '获取指定的工作项列表（单空间）',
	value: 'work_item_instance_search:single_space',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Work Item Type Names or IDs',
			name: 'work_item_type_keys',
			type: 'multiOptions',
			default: [],
			required: true,
			description: '选择要筛选的工作项类型（可多选）。需要先选择空间。Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemTypes',
			},
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
			displayName: 'Work Item Name',
			name: 'work_item_name',
			type: 'string',
			default: '',
			description: '工作项名称（支持模糊搜索）',
		},
		{
			displayName: 'User Keys',
			name: 'user_keys',
			type: 'string',
			default: '',
			description: '用户 user_key 列表，多个用逗号分隔。支持搜索创建人/关注人/角色人员为该用户的相关工作项',
		},
		{
			displayName: 'Work Item IDs',
			name: 'work_item_ids',
			type: 'string',
			default: '',
			description: '工作项 ID 列表，多个用逗号分隔，也支持表达式数组。在工作项实例中右上角单击 ... > ID 获取.',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: 'Created At Start',
					name: 'created_at_start',
					type: 'dateTime',
					default: '',
					description: '创建时间起始。支持日期选择器或表达式传入毫秒时间戳。支持时间区间查询，可不传截止时间代表至今。',
				},
				{
					displayName: 'Created At End',
					name: 'created_at_end',
					type: 'dateTime',
					default: '',
					description: '创建时间截止。支持日期选择器或表达式传入毫秒时间戳。',
				},
				{
					displayName: 'Updated At Start',
					name: 'updated_at_start',
					type: 'dateTime',
					default: '',
					description: '更新时间起始。支持日期选择器或表达式传入毫秒时间戳。支持时间区间查询，可不传截止时间代表至今。',
				},
				{
					displayName: 'Updated At End',
					name: 'updated_at_end',
					type: 'dateTime',
					default: '',
					description: '更新时间截止。支持日期选择器或表达式传入毫秒时间戳。',
				},
				{
					displayName: 'Sub Stages',
					name: 'sub_stages',
					type: 'string',
					default: '',
					description: '需求工作项状态列表，多个用逗号分隔。已合并到 work_item_status，非需求不可使用，建议直接使用 work_item_status。',
				},
				{
					displayName: 'Work Item Status',
					name: 'work_item_status',
					type: 'json',
					default: '[]',
					description: '工作项状态列表，JSON数组格式。遵循 WorkItemStatus 结构：[{"state_key": "xxx"}]。可从获取字段信息接口的 work_item_status 字段的 options 中获取对应 value。',
				},
				{
					displayName: 'Businesses',
					name: 'businesses',
					type: 'string',
					default: '',
					description: '业务线列表，多个用逗号分隔。可从获取空间下业务线详情接口获取。',
				},
				{
					displayName: 'Priorities',
					name: 'priorities',
					type: 'string',
					default: '',
					description: '优先级列表，多个用逗号分隔。可从获取字段信息中 priority 字段的 options 中获取具体的优先级值。',
				},
				{
					displayName: 'Tags',
					name: 'tags',
					type: 'string',
					default: '',
					description: '用于筛选工作项的标签列表，多个用逗号分隔。可在获取字段信息中 tags 字段的 options 中获取。',
				},
				{
					displayName: 'Search ID',
					name: 'search_id',
					type: 'string',
					default: '',
					description: '搜索 ID，可从 open() 中 callback 中的 result 中获取。注意：该参数与其他参数互斥，如果传入了 search_id，则其他参数失效。',
				},
				{
					displayName: 'Need Workflow',
					name: 'need_workflow',
					type: 'boolean',
					default: false,
					description: 'Whether to include workflow information (currently only supports node flow)',
				},
				{
					displayName: 'Need Multi Text',
					name: 'need_multi_text',
					type: 'boolean',
					default: false,
					description: 'Whether to include rich text detailed information',
				},
				{
					displayName: 'Relation Fields Detail',
					name: 'relation_fields_detail',
					type: 'boolean',
					default: false,
					description: 'Whether to include related fields detailed information',
				},
				{
					displayName: 'Timeout',
					name: 'timeout',
					type: 'number',
					default: 10000,
					description: '请求超时时间（毫秒）。',
				},
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const workItemTypeKeys = this.getNodeParameter('work_item_type_keys', index, []) as string[];
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const workItemName = this.getNodeParameter('work_item_name', index, '') as string;
		const userKeysStr = this.getNodeParameter('user_keys', index, '') as string;
		const workItemIdsRaw = this.getNodeParameter('work_item_ids', index, '') as string | string[] | number[];
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 构建请求体
		const baseBody: IDataObject = {};

		// 工作项类型
		if (workItemTypeKeys && workItemTypeKeys.length > 0) {
			baseBody.work_item_type_keys = workItemTypeKeys;
		}

		// 工作项名称
		if (workItemName) {
			baseBody.work_item_name = workItemName;
		}

		// 用户 keys
		if (userKeysStr) {
			baseBody.user_keys = userKeysStr.split(',').map(s => s.trim()).filter(s => s);
		}

		// 工作项 IDs（兼容表达式数组和逗号分隔字符串）
		if (workItemIdsRaw && (Array.isArray(workItemIdsRaw) ? workItemIdsRaw.length > 0 : workItemIdsRaw !== '')) {
			if (Array.isArray(workItemIdsRaw)) {
				baseBody.work_item_ids = workItemIdsRaw
					.map((id) => typeof id === 'number' ? id : parseInt(String(id).trim(), 10))
					.filter((id) => !isNaN(id));
			} else {
				baseBody.work_item_ids = workItemIdsRaw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
			}
		}

		// 处理 Options 中的参数

		// 辅助函数：将日期时间值转换为毫秒时间戳
		const toTimestamp = (value: string | number | undefined): number | undefined => {
			if (value === undefined || value === '' || value === null) return undefined;
			// 如果是数字或纯数字字符串，直接作为时间戳
			if (typeof value === 'number') return value;
			if (/^\d+$/.test(value)) return parseInt(value, 10);
			// 否则尝试解析为日期字符串
			const date = new Date(value);
			if (!isNaN(date.getTime())) return date.getTime();
			return undefined;
		};

		// 创建时间过滤
		if (options.created_at_start || options.created_at_end) {
			const createdAt: IDataObject = {};
			const startTs = toTimestamp(options.created_at_start as string | number);
			const endTs = toTimestamp(options.created_at_end as string | number);
			if (startTs !== undefined) createdAt.start = startTs;
			if (endTs !== undefined) createdAt.end = endTs;
			if (Object.keys(createdAt).length > 0) baseBody.created_at = createdAt;
		}

		// 更新时间过滤
		if (options.updated_at_start || options.updated_at_end) {
			const updatedAt: IDataObject = {};
			const startTs = toTimestamp(options.updated_at_start as string | number);
			const endTs = toTimestamp(options.updated_at_end as string | number);
			if (startTs !== undefined) updatedAt.start = startTs;
			if (endTs !== undefined) updatedAt.end = endTs;
			if (Object.keys(updatedAt).length > 0) baseBody.updated_at = updatedAt;
		}

		if (options.sub_stages) {
			baseBody.sub_stages = (options.sub_stages as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.work_item_status) {
			baseBody.work_item_status = NodeUtils.parseJsonParameter(options.work_item_status as string, 'Work Item Status');
		}
		if (options.businesses) {
			baseBody.businesses = (options.businesses as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.priorities) {
			baseBody.priorities = (options.priorities as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.tags) {
			baseBody.tags = (options.tags as string).split(',').map(s => s.trim()).filter(s => s);
		}
		if (options.search_id) {
			baseBody.search_id = options.search_id;
		}

		// 构建 expand 对象
		const expand: IDataObject = {};
		if (options.need_workflow) expand.need_workflow = true;
		if (options.need_multi_text) expand.need_multi_text = true;
		if (options.relation_fields_detail) expand.relation_fields_detail = true;
		if (Object.keys(expand).length > 0) {
			baseBody.expand = expand;
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
				url: `/open_api/${project_key}/work_item/filter`,
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

export default WorkItemInstanceSearchSingleSpaceOperate;
