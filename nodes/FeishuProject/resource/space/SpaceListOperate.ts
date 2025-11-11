import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const SpaceListOperate: ResourceOperations = {
	name: '获取空间列表',
	value: 'space:list',
	options: [
		{
			displayName: '用户标识',
			name: 'user_key',
			type: 'string',
			default: '',
			description: '指定用户的唯一标识，用于查询该用户的相关信息。留空时将使用凭据中的用户ID。开发者自己的 user_key 可在飞书项目空间左下角双击个人头像获取；租户内其他成员的 user_key 请通过搜索租户内的用户列表接口获取。',
		},
		{
			displayName: '排序方式',
			name: 'order',
			type: 'options',
			options: [
				{
					name: '不排序',
					value: '',
				},
				{
					name: '按最近访问时间升序 (Last Visited)',
					value: 'last_visited',
				},
				{
					name: '按最近访问时间升序 (+Last Visited)',
					value: '+last_visited',
				},
				{
					name: '按最近访问时间降序 (-Last Visited)',
					value: '-last_visited',
				},
			],
			default: '',
			description: '排序字段，格式为前缀+排序字段。+号表示升序；-表示降序；不加默认为升序。目前仅支持对 last_visited (最近访问时间)排序。',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const userKey = this.getNodeParameter('user_key', index) as string;
		const orderValue = this.getNodeParameter('order', index) as string;

		const body: IDataObject = {};

		// 如果用户没有提供user_key，则使用凭据中的userId
		if (!userKey) {
			const credentials = await this.getCredentials('feishuProjectApi');
			body.user_key = credentials.userId as string;
		} else {
			body.user_key = userKey;
		}

		// 如果选择了排序方式，则添加到body中
		if (orderValue) {
			body.order = [orderValue];
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/projects`,
			body: body,
		});
	}
};

export default SpaceListOperate;
