import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkItemInstanceTaskResultOperate: ResourceOperations = {
	name: '获取批量更新处理进度',
	value: 'work_item_instance:task_result',
	order: 60,
	options: [
		{
			displayName: '任务ID',
			name: 'task_id',
			type: 'string',
			required: true,
			default: '',
			description: '任务的唯一标识ID',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const task_id = this.getNodeParameter('task_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/task_result`,
			qs: {
				task_id: task_id,
			},
			timeout: options.timeout,
		});
	}
};

export default WorkItemInstanceTaskResultOperate;
