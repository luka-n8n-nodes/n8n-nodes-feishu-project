import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemInstanceAbortOperate: ResourceOperations = {
	name: '终止/恢复工作项',
	value: 'work_item_instance:abort',
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
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: '是否终止',
			name: 'is_aborted',
			type: 'boolean',
			default: true,
			description: 'Whether to abort or restore the work item. true: 终止需求; false: 恢复需求.',
		},
		{
			displayName: '原因选项',
			name: 'reason_option',
			type: 'options',
			default: 'other',
			description: '终止/恢复原因选项。终止原因: cancel(取消), repeat(重复/合并), test(测试一下), other(其他)；恢复原因: restart(重启), rollback(误操作回退), test(测试), other(其他)',
			options: [
				{ name: 'Cancel - 取消', value: 'cancel' },
				{ name: 'Other - 其他', value: 'other' },
				{ name: 'Repeat - 重复/合并', value: 'repeat' },
				{ name: 'Restart - 重启', value: 'restart' },
				{ name: 'Rollback - 误操作回退', value: 'rollback' },
				{ name: 'Test - 测试', value: 'test' },
			],
		},
		{
			displayName: '原因',
			name: 'reason',
			type: 'string',
			default: '',
			description: '终止或恢复需求的原因，当 reason_option 为 other 时，此字段为必填',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const is_aborted = this.getNodeParameter('is_aborted', index) as boolean;
		const reason_option = this.getNodeParameter('reason_option', index) as string;
		const reason = this.getNodeParameter('reason', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {
			is_aborted,
			reason_option,
		};
		if (reason) {
			body.reason = reason;
		}

		return RequestUtils.request.call(this, {
			method: 'PUT',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/abort`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceAbortOperate;
