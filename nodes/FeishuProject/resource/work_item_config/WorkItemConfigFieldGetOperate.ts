import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigFieldGetOperate: ResourceOperations = {
	name: '获取字段信息',
	value: 'work_item_config:field_get',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"work_item_type_key": ""
			}, null, 2),
			description: '完整的请求体参数，JSON格式',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/field/all`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigFieldGetOperate;
