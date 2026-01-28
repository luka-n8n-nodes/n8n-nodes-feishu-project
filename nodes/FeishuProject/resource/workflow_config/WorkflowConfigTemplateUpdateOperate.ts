import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkflowConfigTemplateUpdateOperate: ResourceOperations = {
	name: '更新流程模板',
	value: 'workflow_config:template_update',
	order: 4,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '模板ID',
			name: 'template_id',
			type: 'string',
			default: '',
			required: true,
			description: '模板 ID。如果不提供，将自动选择指定工作项类型的第一个流程模板。可通过以下方式获取：1. 通过"获取创建工作项元数据"接口的 template 字段的 options 中，选择对应的 value；2. 通过"工作项下流程模板列表"接口返回的 template_id；3. 通过"获取字段信息"接口的 template 字段的 options 中，选择对应的 value',
		},
		{
			displayName: '节点流程配置',
			name: 'workflow_confs',
			type: 'json',
			default: JSON.stringify([], null, 2),
			description: '节点流程配置，遵循 WorkflowConf 结构规范，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/5hi2qv80',
		},
		{
			displayName: '状态流程配置',
			name: 'state_flow_confs',
			type: 'json',
			default: JSON.stringify([], null, 2),
			description: '状态流程配置，遵循 StateFlowConf 结构规范，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/5hi2qv80',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const projectKey = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const templateId = this.getNodeParameter('template_id', index) as string;
		const workflowConfsParam = this.getNodeParameter('workflow_confs', index) as string;
		const stateFlowConfsParam = this.getNodeParameter('state_flow_confs', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {
			project_key: projectKey,
			template_id: Number(templateId),
		};

		// 处理 workflow_confs
		if (workflowConfsParam && workflowConfsParam.trim()) {
			body.workflow_confs = NodeUtils.parseJsonParameter(workflowConfsParam, '节点流程配置');
		}

		// 处理 state_flow_confs
		if (stateFlowConfsParam && stateFlowConfsParam.trim()) {
			body.state_flow_confs = NodeUtils.parseJsonParameter(stateFlowConfsParam, '状态流程配置');
		}

		return RequestUtils.request.call(this, {
			method: 'PUT',
			url: `/open_api/template/v2/update_template`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkflowConfigTemplateUpdateOperate;
