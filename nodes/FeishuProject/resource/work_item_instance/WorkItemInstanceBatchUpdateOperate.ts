import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceBatchUpdateOperate: ResourceOperations = {
	name: '批量更新工作项字段值',
	value: 'work_item_instance:batch_update',
	order: 50,
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
			default: '',
			required: true,
			description: '工作项ID列表，多个ID用逗号分隔，也支持表达式数组。一次请求最大50个',
		},
		{
			displayName: '更新模式',
			name: 'update_mode',
			type: 'options',
			options: [
				{
					name: 'APPEND - 追加',
					value: 'APPEND',
					description: '仅支持 多选人员、多选、多选关联工作项（非级联）三种字段类型',
				},
				{
					name: 'UPDATE - 覆盖',
					value: 'UPDATE',
					description: '不支持 计算字段、系统外信号 字段类型',
				},
				{
					name: 'REPLACE - 替换',
					value: 'REPLACE',
					description: '仅支持 单选、级联单选、多选、单选按钮、单选人员、多选人员、单选关联工作项、多选关联工作项（非级联）',
				},
			],
			default: 'UPDATE',
			required: true,
			description: '本次批量操作的更新方式',
		},
		{
			displayName: '字段Key',
			name: 'field_key',
			type: 'string',
			default: '',
			required: true,
			description: '待修改字段ID，批量修改仅支持单个字段修改（可修改字段类型见 update_mode 参数说明）',
		},
		{
			displayName: '被替换的字段值',
			name: 'before_field_value',
			type: 'json',
			default: '',
			required: true,
			displayOptions: {
				show: {
					update_mode: ['REPLACE'],
				},
			},
			description: '被替换的字段值（当 update_mode=REPLACE 时必填，其余情况下忽略），JSON格式。可参考<a href="https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/project-v2/work_item/field-value-format">字段与属性解析格式</a>',
		},
		{
			displayName: '目标字段值',
			name: 'after_field_value',
			type: 'json',
			default: '',
			required: true,
			description: '操作类型的目标字段值，JSON格式。允许 field_value 为空，等价于删除。可参考<a href="https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/project-v2/work_item/field-value-format">字段与属性解析格式</a>',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_ids_raw = this.getNodeParameter('work_item_ids', index) as string | string[] | number[];
		const update_mode = this.getNodeParameter('update_mode', index) as string;
		const field_key = this.getNodeParameter('field_key', index) as string;
		const after_field_value_param = this.getNodeParameter('after_field_value', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		// 解析工作项ID列表，转换为数字数组（兼容表达式数组和逗号分隔字符串）
		let work_item_ids: number[];
		if (Array.isArray(work_item_ids_raw)) {
			work_item_ids = work_item_ids_raw
				.map((id) => typeof id === 'number' ? id : parseInt(String(id).trim(), 10))
				.filter((id) => !isNaN(id));
		} else {
			work_item_ids = work_item_ids_raw
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id !== '')
				.map((id) => parseInt(id, 10));
		}

		// 解析目标字段值
		const after_field_value = NodeUtils.parseJsonParameter(after_field_value_param, '目标字段值');

		const body: IDataObject = {
			project_key,
			work_item_type_key,
			work_item_ids,
			update_mode,
			field_key,
			after_field_value,
		};

		// 当更新模式为REPLACE时，添加被替换的字段值
		if (update_mode === 'REPLACE') {
			const before_field_value_param = this.getNodeParameter('before_field_value', index, '') as string;
			if (before_field_value_param) {
				body.before_field_value = NodeUtils.parseJsonParameter(before_field_value_param, '被替换的字段值');
			}
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/work_item/batch_update`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceBatchUpdateOperate;
