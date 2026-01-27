import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkflowConfigTemplateDetailOperate: ResourceOperations = {
	name: '获取流程模板配置详情',
	value: 'workflow_config:template_detail',
	order: 3,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
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
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
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
