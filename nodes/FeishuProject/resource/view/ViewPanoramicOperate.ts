import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const ViewPanoramicOperate: ResourceOperations = {
	name: '获取视图下工作项列表（全景视图）',
	value: 'view:panoramic',
	order: 3,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '视图ID',
			name: 'view_id',
			type: 'string',
			required: true,
			default: '',
			description: '视图的唯一标识ID',
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
					displayName: 'Need Workflow',
					name: 'need_workflow',
					type: 'boolean',
					default: true,
					description: 'Whether to include workflow information',
				},
				{
					displayName: 'Relation Fields Detail',
					name: 'relation_fields_detail',
					type: 'boolean',
					default: true,
					description: 'Whether to include related fields detail',
				},
				{
					displayName: 'Need Multi Text',
					name: 'need_multi_text',
					type: 'boolean',
					default: true,
					description: 'Whether to include rich text detail',
				},
				{
					displayName: 'Need User Detail',
					name: 'need_user_detail',
					type: 'boolean',
					default: true,
					description: 'Whether to include user detail',
				},
				{
					displayName: 'Need Sub Task Parent',
					name: 'need_sub_task_parent',
					type: 'boolean',
					default: true,
					description: 'Whether to include sub task parent info',
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
		const view_id = this.getNodeParameter('view_id', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 构建 expand 对象
		const expand: IDataObject = {
			need_workflow: options.need_workflow !== false,
			relation_fields_detail: options.relation_fields_detail !== false,
			need_multi_text: options.need_multi_text !== false,
			need_user_detail: options.need_user_detail !== false,
			need_sub_task_parent: options.need_sub_task_parent !== false,
		};

		// 统一的请求函数
		const fetchPage = async (pageNum: number, pageSize: number) => {
			const body: IDataObject = {
				page_num: pageNum,
				page_size: pageSize,
				expand: expand,
			};

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: `/open_api/${project_key}/view/${view_id}`,
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

export default ViewPanoramicOperate;
