import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const UserSearchOperate: ResourceOperations = {
	name: '搜索租户内的用户列表',
	value: 'user:search',
	order: 1,
	options: [
		{
			displayName: '搜索关键词',
			name: 'query',
			type: 'string',
			default: '',
			description: '搜索的关键词，例如用户名称',
		},
		DESCRIPTIONS.PROJECT_KEY_OPTIONAL,
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const query = this.getNodeParameter('query', index) as string;
		const projectKey = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {};

		// 如果提供了 query，则添加到 body 中
		if (query && query.trim()) {
			body.query = query.trim();
		}

		// 如果提供了 project_key，则添加到 body 中
		if (projectKey && projectKey.trim()) {
			body.project_key = projectKey.trim();
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/user/search`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default UserSearchOperate;
