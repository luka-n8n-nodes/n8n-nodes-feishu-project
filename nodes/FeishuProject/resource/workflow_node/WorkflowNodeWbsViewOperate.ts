import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { batchingOption, timeoutOption, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

interface IWbsViewOptions extends ICommonOptionsValue {
	need_union_deliverable?: boolean;
	need_schedule_table_agg?: boolean;
	need_wbs_relation_chain_path?: boolean;
	need_wbs_relation_chain_entity?: boolean;
}

const WorkflowNodeWbsViewOperate: ResourceOperations = {
	name: '获取工作流详情（WBS）',
	value: 'workflow_node:wbs_view',
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
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: '是否融合需要交付物',
					name: 'need_union_deliverable',
					type: 'boolean',
					default: false,
					description: 'Whether to include merged deliverable information. 是否需要融合交付物信息.',
				},
				{
					displayName: '是否需要计划表聚合字段',
					name: 'need_schedule_table_agg',
					type: 'boolean',
					default: false,
					description: 'Whether to include schedule table custom column aggregation fields. 扩展查询，是否需要计划表自定义列聚合字段.',
				},
				{
					displayName: '是否需要WBS链路层级信息',
					name: 'need_wbs_relation_chain_path',
					type: 'boolean',
					default: false,
					description: 'Whether to include WBS relation chain path information. 扩展查询，是否需要WBS链路层级信息.',
				},
				{
					displayName: '是否需要WBS链路实例信息',
					name: 'need_wbs_relation_chain_entity',
					type: 'boolean',
					default: false,
					description: 'Whether to include WBS relation chain entity information. 扩展查询，是否需要WBS链路实例信息.',
				},
				batchingOption,
				timeoutOption,
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as IWbsViewOptions;

		const qs: IDataObject = {};
		if (options.need_union_deliverable !== undefined) {
			qs.need_union_deliverable = options.need_union_deliverable;
		}
		if (options.need_schedule_table_agg !== undefined) {
			qs.need_schedule_table_agg = options.need_schedule_table_agg;
		}

		const expand: IDataObject = {};
		if (options.need_union_deliverable !== undefined) {
			expand.need_union_deliverable = options.need_union_deliverable;
		}
		if (options.need_wbs_relation_chain_path !== undefined) {
			expand.need_wbs_relation_chain_path = options.need_wbs_relation_chain_path;
		}
		if (options.need_wbs_relation_chain_entity !== undefined) {
			expand.need_wbs_relation_chain_entity = options.need_wbs_relation_chain_entity;
		}

		const body: IDataObject = {};
		if (Object.keys(expand).length > 0) {
			body.expand = expand;
			Object.assign(body, expand);
		}

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/wbs_view`,
			...(Object.keys(qs).length > 0 && { qs }),
			...(Object.keys(body).length > 0 && { body }),
			timeout: options.timeout,
		});
	}
};

export default WorkflowNodeWbsViewOperate;
