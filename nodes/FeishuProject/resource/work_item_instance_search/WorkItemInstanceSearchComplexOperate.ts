import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceSearchComplexOperate: ResourceOperations = {
	name: '获取指定的工作项列表（单空间-复杂传参）',
	value: 'work_item_instance_search:complex',
	description: '该接口用于在指定空间，搜索符合“复杂筛选条件”的工作项实例。详见<a href="https://project.feishu.cn/b/helpcenter/1p8d7djs/19pti4e2">帮助文档</a>',
	order: 20,
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
			displayName: '筛选类型',
			name: 'filter_type',
			type: 'options',
			default: 'simple',
			required: true,
			description: '选择筛选方式',
			options: [
				{ name: '简单筛选', value: 'simple' },
				{ name: '自定义组合传参筛选（组合搜索使用）', value: 'custom' },
			],
		},
		{
			displayName: '筛选条件逻辑关系',
			name: 'conjunction',
			type: 'options',
			default: 'AND',
			required: true,
			description: '用于指定筛选条件之间的逻辑关系',
			displayOptions: {
				show: {
					filter_type: ['simple'],
				},
			},
			options: [
				{ name: 'AND（所有条件必须同时满足）', value: 'AND' },
				{ name: 'OR（任一条件满足即可）', value: 'OR' },
			],
		},
		{
			displayName: '筛选条件',
			name: 'search_params',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			placeholder: '添加筛选条件',
			default: {},
			description: '固定参数，遵循 SearchParam 结构规范。详见：<a href="https://project.feishu.cn/b/helpcenter/1p8d7djs/19pti4e2">搜索参数格式及常用示例</a>',
			displayOptions: {
				show: {
					filter_type: ['simple'],
				},
			},
			options: [
				{
					displayName: 'Params',
					name: 'params',
					values: [
						{
							displayName: 'Field Name or ID',
							name: 'param_key',
							type: 'options',
							default: '',
							required: true,
							description: '字段 key，可通过获取字段信息接口查询。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							typeOptions: {
								loadOptionsMethod: 'loadWorkItemFieldsAll',
							},
						},
						{
							displayName: 'Operator',
							name: 'operator',
							type: 'options',
							default: 'HAS ANY OF',
							required: true,
							description: '用于指定搜索条件的操作符类型',
							// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
							options: [
								{ name: '存在选项属于 (HAS ANY OF)', value: 'HAS ANY OF' },
								{ name: '全部选项均不属于 (HAS NONE OF)', value: 'HAS NONE OF' },
								{ name: '匹配 (~)', value: 'REG' },
								{ name: '不匹配 (!~)', value: 'NREG' },
								{ name: '等于 (=)', value: 'EQ' },
								{ name: '不等于 (!=)', value: 'NE' },
								{ name: '小于 (<)', value: 'LT' },
								{ name: '大于 (>)', value: 'GT' },
								{ name: '小于等于 (<=)', value: 'LTE' },
								{ name: '大于等于 (>=)', value: 'GTE' },
								{ name: '为空 (IS NULL)', value: 'IS NULL' },
								{ name: '不为空 (IS NOT NULL)', value: 'IS NOT NULL' },
								{ name: '包含 (CONTAINS)', value: 'CONTAINS' },
								{ name: '不包含 (NOT CONTAINS)', value: 'NOT CONTAINS' },
								{ name: '满足 (MEET)', value: 'MEET' },
								{ name: '不满足 (NOT MEET)', value: 'NOT MEET' },
							],
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'string',
							default: '',
							description: '搜索字段值结构，该字段支持多种格式，具体取决于 param_key 和 operator 的组合。对于复杂类型（如数组、对象），请输入 JSON 格式字符串。',
						},
					],
				},
			],
		},
		{
			displayName: '自定义筛选参数',
			name: 'custom_search_group',
			type: 'json',
			default: JSON.stringify({
				search_params: [],
				conjunction: 'AND',
				search_groups: [],
			}, null, 2),
			description: '自定义筛选组参数，遵循 SearchGroup 结构规范。详见：<a href="https://project.feishu.cn/b/helpcenter/1p8d7djs/19pti4e2">搜索参数格式及常用示例</a>',
			displayOptions: {
				show: {
					filter_type: ['custom'],
				},
			},
		},
		{
			displayName: '返回字段',
			name: 'fields',
			type: 'string',
			default: '',
			description: '工作项中的字段标识，非必填，默认返回全部。字段格式可查看<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/1tj6ggll">字段与属性解析格式</a>。支持两种模式（不可混用）：指定字段 - 仅返回列出的字段，如 ["aborted","role_owners"]；排除字段 - 以 - 开头排除该字段，如 ["-aborted","-role_owners"]',
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
			displayName: '选项',
			name: 'options',
			type: 'collection',
			placeholder: '添加选项',
			default: {},
			options: [
				{
					displayName: '返回工作流信息',
					name: 'need_workflow',
					type: 'boolean',
					default: false,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否需要工作流信息(目前只支持节点流)。',
				},
				{
					displayName: '返回富文本详细信息',
					name: 'need_multi_text',
					type: 'boolean',
					default: false,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否需要富文本详细信息。',
				},
				{
					displayName: '返回关联字段详细信息',
					name: 'relation_fields_detail',
					type: 'boolean',
					default: false,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否需要关联字段详细信息。',
				},
				{
					displayName: '超时时间',
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
		const filterType = this.getNodeParameter('filter_type', index, 'simple') as string;
		const fields_raw = this.getNodeParameter('fields', index, '') as string | string[];
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		let search_group: IDataObject;

		if (filterType === 'custom') {
			// 自定义组合传参筛选
			const customSearchGroupRaw = this.getNodeParameter('custom_search_group', index, '{}') as string;
			search_group = NodeUtils.parseJsonParameter(customSearchGroupRaw, '自定义筛选参数');
		} else {
			// 简单筛选
			const conjunction = this.getNodeParameter('conjunction', index, 'AND') as string;
			const searchParamsCollection = this.getNodeParameter('search_params', index, {}) as IDataObject;

			// 构建 search_params 数组
			const paramsArray = (searchParamsCollection.params as IDataObject[]) || [];
			const search_params = paramsArray.map((item) => {
				let fieldValue = item.value;

				// 尝试解析 JSON 字符串（支持复杂类型如数组、对象）
				if (typeof fieldValue === 'string' && fieldValue.trim()) {
					try {
						// 检查是否是 JSON 格式
						if (
							(fieldValue.trim().startsWith('[') && fieldValue.trim().endsWith(']')) ||
							(fieldValue.trim().startsWith('{') && fieldValue.trim().endsWith('}'))
						) {
							fieldValue = JSON.parse(fieldValue);
						}
					} catch {
						// 解析失败则保持原始字符串
					}
				}

				// 将 operator 别名映射回 API 所需的符号
				const operatorMapping: Record<string, string> = {
					'REG': '~',
					'NREG': '!~',
					'EQ': '=',
					'NE': '!=',
					'LT': '<',
					'GT': '>',
					'LTE': '<=',
					'GTE': '>=',
				};
				const operatorValue = operatorMapping[item.operator as string] || item.operator;

				const param: IDataObject = {
					param_key: item.param_key,
					operator: operatorValue,
					value: fieldValue,
				};

				return param;
			});

			// 构建 search_group 对象
			search_group = {
				search_params,
				conjunction,
				search_groups: [],
			};
		}

		// 构建请求体：合并 search_group、fields、expand
		const buildBody = (pageNum: number, pageSize: number): IDataObject => {
			const body: IDataObject = {
				search_group,
				page_num: pageNum,
				page_size: pageSize,
			};
			// 处理 fields，兼容表达式数组和逗号分隔字符串
			if (fields_raw) {
				if (Array.isArray(fields_raw)) {
					body.fields = (fields_raw as string[]).map(f => String(f).trim()).filter(f => f);
				} else if (typeof fields_raw === 'string' && fields_raw.trim()) {
					body.fields = fields_raw.split(',').map(f => f.trim()).filter(f => f);
				}
			}
			// 构建 expand 对象（来自 options）
			const expand: IDataObject = {};
			if (options.need_workflow !== undefined) {
				expand.need_workflow = options.need_workflow;
			}
			if (options.need_multi_text !== undefined) {
				expand.need_multi_text = options.need_multi_text;
			}
			if (options.relation_fields_detail !== undefined) {
				expand.relation_fields_detail = options.relation_fields_detail;
			}
			if (Object.keys(expand).length > 0) {
				body.expand = expand;
			}
			return body;
		};

		// 统一的请求函数
		const fetchPage = async (pageNum: number, pageSize: number) => {
			const body = buildBody(pageNum, pageSize);

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: `/open_api/${project_key}/work_item/${work_item_type_key}/search/params`,
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

export default WorkItemInstanceSearchComplexOperate;
