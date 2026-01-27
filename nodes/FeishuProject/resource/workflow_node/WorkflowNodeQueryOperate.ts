import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkflowNodeQueryOperate: ResourceOperations = {
	name: '获取工作流详情',
	value: 'workflow_node:query',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型的唯一标识Key',
		},
		{
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项的唯一标识ID',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"fields": [],
				// "flow_type": 0,
				"expand": {
					"need_workflow": true,
					"relation_fields_detail": true,
					"need_multi_text": true,
					"need_user_detail": true,
					"need_sub_task_parent": true
				}
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/5hcmcl04',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_type_key}/${work_item_id}/workflow/query`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkflowNodeQueryOperate;
