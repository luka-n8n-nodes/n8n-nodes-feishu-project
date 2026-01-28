import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { batchingOption, timeoutOption } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceCreateOperate: ResourceOperations = {
	name: '创建工作项',
	value: 'work_item_instance:create',
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
			displayName: '工作项名称',
			name: 'name',
			type: 'string',
			default: '',
		},
		{
			displayName: '字段值',
			name: 'field_value_pairs',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			placeholder: '添加字段',
			default: {},
			description: '字段值列表。可参考<a href="https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/project-v2/work_item/field-value-format">字段与属性解析格式</a>',
			options: [
				{
					displayName: '字段',
					name: 'fields',
					values: [
						{
							displayName: '字段名称 Name or ID',
							name: 'field_key',
							type: 'options',
							default: '',
							required: true,
							description: '选择要设置的字段。需要先选择空间和工作项类型。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							typeOptions: {
								loadOptionsMethod: 'loadWorkItemFields',
							},
						},
						// TODO: 暂时注释掉 field_type_key，后续可能需要
						// {
						// 	displayName: '字段类型',
						// 	name: 'field_type_key',
						// 	type: 'options',
						// 	default: '',
						// 	description: '字段类型，用于指定字段值的格式。留空则自动判断。详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/1tj6ggll',
						// 	// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
						// 	options: [
						// 		{ name: '（自动判断）', value: '' },
						// 		{ name: '单行文本/多行文本', value: 'text' },
						// 		{ name: '富文本', value: 'multi_text' },
						// 		{ name: '单选', value: 'select' },
						// 		{ name: '多选', value: 'multi_select' },
						// 		{ name: '级联单选', value: 'tree_select' },
						// 		{ name: '级联多选', value: 'tree_multi_select' },
						// 		{ name: '单选按钮', value: 'radio' },
						// 		{ name: '单选人员', value: 'user' },
						// 		{ name: '多选人员', value: 'multi_user' },
						// 		{ name: '日期/日期时间', value: 'date' },
						// 		{ name: '日期区间', value: 'schedule' },
						// 		{ name: 'URL 链接', value: 'link' },
						// 		{ name: '数字', value: 'number' },
						// 		{ name: '开关', value: 'bool' },
						// 		{ name: '复合字段', value: 'compound_field' },
						// 		{ name: '单选关联工作项', value: 'work_item_related_select' },
						// 		{ name: '多选关联工作项', value: 'work_item_related_multi_select' },
						// 		{ name: '飞书云文档', value: 'link_cloud_doc' },
						// 		{ name: '角色与人员', value: 'role_owners' },
						// 		{ name: '业务线', value: 'business' },
						// 		{ name: '群ID', value: 'chat_group' },
						// 		{ name: '拉群方式', value: 'group_type' },
						// 		{ name: '关注人', value: 'watchers' },
						// 		{ name: '描述', value: 'description' },
						// 		{ name: '电话号码', value: 'telephone' },
						// 		{ name: '电子邮件', value: 'email' },
						// 	],
						// },
						{
							displayName: '字段值',
							name: 'field_value',
							type: 'string',
							default: '',
							description: '字段值，支持任意类型。对于复杂类型（如数组、对象），请输入 JSON 格式字符串。',
						},
					],
				},
			],
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: '流程模板ID',
					name: 'template_id',
					type: 'string',
					default: '',
					description: '工作项流程模板 ID，未传值时默认使用该工作项类型的第一个流程模板',
				},
				{
					displayName: '必填模式',
					name: 'required_mode',
					type: 'options',
					options: [
						{
							name: '不校验必填项',
							value: 0,
						},
						{
							name: '校验新建页必填项',
							value: 1,
						},
					],
					default: 0,
					description: '创建工作项必填模式',
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
		const name = this.getNodeParameter('name', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		// 从 options 中获取可选参数
		const template_id = (options.template_id as string) || '';
		const required_mode = (options.required_mode as number) || 0;

		// 获取 fixedCollection 中的字段数据
		const fieldValuePairsCollection = this.getNodeParameter('field_value_pairs', index, {}) as IDataObject;
		const fieldsArray = (fieldValuePairsCollection.fields as IDataObject[]) || [];

		// 转换为 API 所需格式
		const field_value_pairs = fieldsArray.map((item) => {
			let fieldValue = item.field_value;

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

			return {
				field_key: item.field_key,
				field_value: fieldValue,
			};

			// TODO: 暂时注释掉 field_type_key 处理逻辑，后续可能需要
			// const result: IDataObject = {
			// 	field_key: item.field_key,
			// 	field_value: fieldValue,
			// };
			// // 如果指定了字段类型，则添加到请求中
			// if (item.field_type_key) {
			// 	result.field_type_key = item.field_type_key;
			// }
			// return result;
		});

		const body: IDataObject = {
			work_item_type_key,
			field_value_pairs,
		};

		if (name) {
			body.name = name;
		}
		if (template_id && template_id.trim()) {
			body.template_id = Number(template_id);
		}
		if (required_mode) {
			body.required_mode = required_mode;
		}

		const result = await RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/create`,
			body,
			timeout: options.timeout as number,
		});
		return {
			body,
			work_item_id: result,
		}
	}
};

export default WorkItemInstanceCreateOperate;
