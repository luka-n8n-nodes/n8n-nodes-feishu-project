import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
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
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"page_size": 10,
				"page_num": 1,
				"expand": {
					"need_workflow": true,
					"relation_fields_detail": true,
					"need_multi_text": true,
					"need_user_detail": true,
					"need_sub_task_parent": true
				}
			}, null, 2),
			description: '完整的请求体参数，JSON格式',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const view_id = this.getNodeParameter('view_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/view/${view_id}`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default ViewPanoramicOperate;
