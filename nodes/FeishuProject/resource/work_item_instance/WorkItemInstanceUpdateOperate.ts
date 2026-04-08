import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceUpdateOperate: ResourceOperations = {
	name: '更新工作项',
	value: 'work_item_instance:update',
	order: 40,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项类型 Name or ID',
			name: 'work_item_type_key',
			type: 'options',
			default: '',
			required: true,
			description: '空间下工作项类型，需要先选择空间，详见：<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/3pjp854w">获取空间下工作项类型</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
			displayName: '字段动态赋值',
			name: 'update_fields',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			placeholder: '添加字段',
			default: {},
			description: '需要更新的字段列表。可参考<a href="https://project.feishu.cn/b/helpcenter/1p8d7djs/1tj6ggll">字段与属性解析格式</a>',
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
							description: '选择要更新的字段。需要先选择空间和工作项类型。字段定义可以通过调用 工作项配置 - 获取字段信息 查看字段定义列表. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							typeOptions: {
								loadOptionsMethod: 'loadWorkItemFields',
							},
						},
						{
							displayName: '字段值',
							name: 'field_value',
							type: 'string',
							default: '',
							description:
							'字段值，支持任意类型。对于复杂类型（如数组、对象），请输入 JSON 格式字符串。' +
							'<br/><br/>传值示例：' +
							'<br/><b>text</b>: 直接输入字符串即可' +
							'<br/><b>multi_text</b>: [{"type":"paragraph","content":[{"type":"text","text":"文本","attrs":{"fontColor":"blue","italic":"true","underline":"true"}}]}]' +
							'<br/><b>select</b>: {"label":"选项1","value":"8lheuaepp"}（value 为选项ID，必填；label 可选）' +
							'<br/><b>multi_select</b>: [{"label":"选项1","value":"b0gzgge5o"},{"label":"选项4","value":"et15_j7yl"}]（value 为选项ID，必填；label 可选）' +
							'<br/><b>user</b>: 735679528XXXXX（用户 user_key）' +
							'<br/><b>multi_user</b>: ["735679528XXXXX","731189198XXXXX"]（用户 user_key 数组）',
						},
					],
				},
			],
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;

		// 获取 fixedCollection 中的字段数据
		const updateFieldsCollection = this.getNodeParameter('update_fields', index, {}) as IDataObject;
		const fieldsArray = (updateFieldsCollection.fields as IDataObject[]) || [];

		// 转换为 API 所需格式
		const update_fields = fieldsArray.map((item) => {
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
		});

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		 await RequestUtils.request.call(this, {
			method: 'PUT',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}`,
			body: {
				update_fields,
			},
			timeout: options.timeout,
		});

		return {
			update_fields
		}
	}
};

export default WorkItemInstanceUpdateOperate;
