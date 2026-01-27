import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const WorkflowConfigTemplateDetailOperate: ResourceOperations = {
	name: '获取流程模板配置详情',
	value: 'workflow_config:template_detail',
	order: 3,
	options: [
		{
			displayName: '项目Key',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '项目的唯一标识Key',
		},
		{
			displayName: '模板ID',
			name: 'template_id',
			type: 'string',
			required: true,
			default: '',
			description: '模板的唯一标识ID',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const template_id = this.getNodeParameter('template_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/template_detail/${template_id}`,
			timeout: options.timeout,
		});
	}
};

export default WorkflowConfigTemplateDetailOperate;
