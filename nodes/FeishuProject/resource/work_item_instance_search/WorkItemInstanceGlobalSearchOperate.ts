import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const WorkItemInstanceGlobalSearchOperate: ResourceOperations = {
	name: '获取指定的工作项列表（全局搜索）',
	value: 'work_item_instance_search:global',
	description: '该接口用于按照标题、描述、人员等多字段和工作项类型，跨空间搜索符合条件的工作项实例列表，对应的平台功能可参考<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/4uteveck">全局搜索</a>',
	order: 30,
	options: [
		{
			displayName: '查询类型',
			name: 'query_type',
			type: 'options',
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
			default: 'workitem',
			description: '查询类型，可选值为工作项和视图',
		},
		{
			displayName: '查询内容',
			name: 'query',
			type: 'string',
			required: true,
			default: '',
			description: '按照标题、描述、人员等多字段搜索符合条件的工作项实例列表',
		},
		{
			displayName: '空间简称',
			name: 'simple_names',
			type: 'string',
			default: '',
			description: '安装插件的飞书项目空间（simple_name）列表，多个用逗号分隔，支持表达式传入数组。simple_name 一般在飞书项目空间 URL 中获取，例如空间 URL 为 "https://project.feishu.cn/doc/overview"，则 simple_name 为 "doc"。',
		},
		{
			displayName: '工作项类型列表',
			name: 'query_sub_type',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					query_type: ['workitem'],
				},
			},
			description: '指定工作项类型列表，用于筛选查询结果，多个用逗号分隔，支持表达式传入数组',
		},
		{
			displayName: '空间 Names or IDs',
			name: 'project_keys',
			type: 'multiOptions',
			default: [],
			description: '指定搜索的空间范围，为空间 key 的列表。可多选或通过表达式传入数组。Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadSpaces',
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
				maxValue: 200,
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
		const query_type = this.getNodeParameter('query_type', index) as string;
		const query = this.getNodeParameter('query', index) as string;
		const simpleNamesInput = this.getNodeParameter('simple_names', index, '') as string | string[];
		const querySubTypeInput = this.getNodeParameter('query_sub_type', index, '') as string | string[];
		const projectKeysInput = this.getNodeParameter('project_keys', index, []) as string | string[];
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 解析列表参数（兼容逗号分隔字符串和表达式数组）
		const parseList = (input: string | string[]): string[] => {
			if (Array.isArray(input)) {
				return input.map(s => String(s).trim()).filter(s => s);
			}
			if (!input || !String(input).trim()) return [];
			return String(input).split(',').map(s => s.trim()).filter(s => s);
		};

		const baseBody: IDataObject = {
			query_type,
			query,
		};

		const simpleNames = parseList(simpleNamesInput);
		if (simpleNames.length > 0) {
			baseBody.simple_names = simpleNames;
		}

		const querySubType = parseList(querySubTypeInput);
		if (querySubType.length > 0) {
			baseBody.query_sub_type = querySubType;
		}

		const projectKeys = parseList(projectKeysInput);
		if (projectKeys.length > 0) {
			baseBody.project_keys = projectKeys;
		}

		const fetchPage = async (pageNum: number, pageSize: number) => {
			const body: IDataObject = {
				...baseBody,
				page_size: pageSize,
				page_num: pageNum,
			};

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: '/open_api/compositive_search',
				body,
				timeout: (options.timeout as number) || undefined,
			}) as any;

			return {
				data: response?.data || [],
				total: response?.pagination?.total || 0,
			};
		};

		if (returnAll) {
			let allResults: any[] = [];
			let pageNum = 1;
			const pageSize = 50;

			while (true) {
				const { data, total } = await fetchPage(pageNum, pageSize);
				allResults = allResults.concat(data);

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
			const pageSize = Math.min(limit, 50);
			const { data } = await fetchPage(1, pageSize);
			return data.slice(0, limit);
		}
	},
};

export default WorkItemInstanceGlobalSearchOperate;
