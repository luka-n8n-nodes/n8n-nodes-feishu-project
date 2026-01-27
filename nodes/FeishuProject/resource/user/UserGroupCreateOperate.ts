import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const UserGroupCreateOperate: ResourceOperations = {
	name: '创建自定义用户组',
	value: 'user_group:create',
	order: 3,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"name": "",
				"users": [""]
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
			url: `/open_api/${project_key}/user_group`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default UserGroupCreateOperate;
