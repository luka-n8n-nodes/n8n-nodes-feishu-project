import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const SpaceListOperate: ResourceOperations = {
	name: '获取空间列表',
	value: 'space:list',
	order: 10,
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
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const orderValue = this.getNodeParameter('order', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const credentials = await this.getCredentials('feishuProjectApi');
		const body: IDataObject = {
			user_key: credentials.userId as string,
		};

		// 如果选择了排序方式，则添加到body中
		if (orderValue) {
			body.order = [orderValue];
		}

		const response = await RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/projects`,
			body: body,
			timeout: options.timeout,
		});

		return {
			data: response,
		}
	}
};

export default SpaceListOperate;
