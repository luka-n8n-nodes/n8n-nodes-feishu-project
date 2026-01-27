import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkflowConfigTemplateCreateOperate: ResourceOperations = {
	name: '新增流程模板',
	value: 'workflow_config:template_create',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			default: '',
			required: true,
			description: '工作项类型的唯一标识Key',
		},
		{
			displayName: '模板名称',
			name: 'template_name',
			type: 'string',
			default: '',
			required: true,
			description: '流程模板名称',
		},
		{
			displayName: '复制模板ID',
			name: 'copy_template_id',
			type: 'string',
			default: '0',
			description: '复制的模板ID，如果提供此参数，将基于该模板创建新模板。默认为0表示不复制',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const projectKey = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const workItemTypeKey = this.getNodeParameter('work_item_type_key', index) as string;
		const templateName = this.getNodeParameter('template_name', index) as string;
		const copyTemplateId = this.getNodeParameter('copy_template_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {
			project_key: projectKey,
			work_item_type_key: workItemTypeKey,
			template_name: templateName,
			copy_template_id: Number(copyTemplateId),
		};

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/template/v2/create_template`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkflowConfigTemplateCreateOperate;
