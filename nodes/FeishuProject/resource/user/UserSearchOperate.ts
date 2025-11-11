import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const UserSearchOperate: ResourceOperations = {
	name: '搜索租户内的用户列表',
	value: 'user:search',
	options: [
		{
			displayName: '搜索关键词',
			name: 'query',
			type: 'string',
			default: '',
			description: '搜索的关键词，例如用户名称',
		},
		{
			displayName: '空间ID',
			name: 'project_key',
			type: 'string',
			default: '',
			description: '空间 ID (project_key)，用于判断所属哪个租户，在飞书项目空间双击空间名称获取',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const query = this.getNodeParameter('query', index) as string;
		const projectKey = this.getNodeParameter('project_key', index) as string;

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
		});
	}
};

export default UserSearchOperate;
