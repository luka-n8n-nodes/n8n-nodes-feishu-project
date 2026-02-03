import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const SpaceListDetailOperate: ResourceOperations = {
	name: '获取空间列表详情（自定义封装）',
	value: 'space:list_detail',
	order: 40,
	options: [
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
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject[]> {
		const orderValue = this.getNodeParameter('order', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const credentials = await this.getCredentials('feishuProjectApi');
		const userKey = credentials.userId as string;

		// 步骤1：获取空间ID列表
		const listBody: IDataObject = {
			user_key: userKey,
		};

		if (orderValue) {
			listBody.order = [orderValue];
		}

		const spaceIds = await RequestUtils.request.call(this, {
			method: 'POST',
			url: '/open_api/projects',
			body: listBody,
			timeout: options.timeout,
		});

		// 如果没有空间，直接返回空数组
		if (!Array.isArray(spaceIds) || spaceIds.length === 0) {
			return [];
		}

		// 步骤2：获取空间详情（API 限制最多100个）
		const limitedKeys = spaceIds.slice(0, 100);

		const detailBody: IDataObject = {
			project_keys: limitedKeys,
			user_key: userKey,
		};

		const response = await RequestUtils.request.call(this, {
			method: 'POST',
			url: '/open_api/projects/detail',
			body: detailBody,
			timeout: options.timeout,
		});

		// 将对象格式转换为数组格式
		if (response && typeof response === 'object') {
			return Object.values(response) as IDataObject[];
		}

		return [];
	},
};

export default SpaceListDetailOperate;
