import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceQueryOperate: ResourceOperations = {
	name: '获取工作项详情',
	value: 'work_item_instance:query',
	order: 10,
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
			displayName: '工作项ID列表',
			name: 'work_item_ids',
			type: 'string',
			required: true,
			default: '',
			description: '工作项ID列表，多个ID用逗号分隔，也支持表达式数组',
		},
		{
			displayName: '返回字段',
			name: 'fields',
			type: 'string',
			default: '',
			description: '工作项中的字段标识，非必填，默认返回全部。字段格式可查看<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/1tj6ggll">字段与属性解析格式</a>。支持两种模式（不可混用）：指定字段 - 仅返回列出的字段，如 ["aborted","role_owners"]；排除字段 - 以 - 开头排除该字段，如 ["-aborted","-role_owners"]',
		},
		{
			displayName: '选项',
			name: 'options',
			type: 'collection',
			placeholder: '添加选项',
			default: {},
			options: [
				{
					displayName: '返回用户详细信息',
					name: 'need_user_detail',
					type: 'boolean',
					default: true,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否返回用户详细信息',
				},
				{
					displayName: '返回工作流信息',
					name: 'need_workflow',
					type: 'boolean',
					default: true,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否返回工作流信息 (目前只支持节点流工作项类型实例，状态流工作项类型实例会返回空结构)',
				},
				{
					displayName: '返回富文本信息',
					name: 'need_multi_text',
					type: 'boolean',
					default: true,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否返回富文本信息',
				},
				{
					displayName: '返回关联详细信息',
					name: 'relation_fields_detail',
					type: 'boolean',
					default: true,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否返回关联详细信息',
				},
				{
					displayName: '补充复合字段组标识',
					name: 'need_group_uuid_for_compound',
					type: 'boolean',
					default: false,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否补充复合字段组标识',
				},
				{
					displayName: '超时时间',
					name: 'timeout',
					type: 'number',
					default: 60000,
					description: '请求超时时间（毫秒）',
				},
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_ids_raw = this.getNodeParameter('work_item_ids', index) as string | string[];
		const fields_raw = this.getNodeParameter('fields', index, '') as string | string[];
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		const body: IDataObject = {};

		// 兼容表达式数组和逗号分隔字符串
		if (Array.isArray(work_item_ids_raw)) {
			body.work_item_ids = work_item_ids_raw.map(id => String(id).trim()).filter(id => id);
		} else {
			body.work_item_ids = work_item_ids_raw.split(',').map(id => id.trim()).filter(id => id);
		}

		// 处理 fields，兼容表达式数组和逗号分隔字符串
		if (fields_raw) {
			if (Array.isArray(fields_raw)) {
				body.fields = fields_raw.map(f => String(f).trim()).filter(f => f);
			} else if (typeof fields_raw === 'string' && fields_raw.trim()) {
				body.fields = fields_raw.split(',').map(f => f.trim()).filter(f => f);
			}
		}

		// 构建 expand 对象
		const expand: IDataObject = {};
		if (options.need_user_detail !== undefined) {
			expand.need_user_detail = options.need_user_detail;
		}
		if (options.need_workflow !== undefined) {
			expand.need_workflow = options.need_workflow;
		}
		if (options.need_multi_text !== undefined) {
			expand.need_multi_text = options.need_multi_text;
		}
		if (options.relation_fields_detail !== undefined) {
			expand.relation_fields_detail = options.relation_fields_detail;
		}
		if (options.need_group_uuid_for_compound !== undefined) {
			expand.need_group_uuid_for_compound = options.need_group_uuid_for_compound;
		}
		if (Object.keys(expand).length > 0) {
			body.expand = expand;
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/query`,
			body: body,
			timeout: options.timeout as number | undefined,
		});
	}
};

export default WorkItemInstanceQueryOperate;
