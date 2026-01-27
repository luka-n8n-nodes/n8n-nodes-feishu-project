import { INodeProperties } from 'n8n-workflow';

/**
 * 批处理选项
 * 用于控制并发请求的批次大小和间隔
 */
export const batchingOption: INodeProperties = {
	displayName: 'Batching',
	name: 'batching',
	placeholder: 'Add Batching',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: false,
	},
	default: {
		batch: {},
	},
	options: [
		{
			displayName: 'Batching',
			name: 'batch',
			values: [
				{
					displayName: 'Items per Batch',
					name: 'batchSize',
					type: 'number',
					typeOptions: {
						minValue: 1,
					},
					default: 50,
					description: '每批并发请求数量。添加此选项后启用并发模式。0 将被视为 1。',
				},
				{
					displayName: 'Batch Interval (Ms)',
					name: 'batchInterval',
					type: 'number',
					typeOptions: {
						minValue: 0,
					},
					default: 1000,
					description: '每批请求之间的时间（毫秒）。0 表示禁用。',
				},
			],
		},
	],
};

/**
 * 超时选项
 * 用于控制请求超时时间
 */
export const timeoutOption: INodeProperties = {
	displayName: 'Timeout',
	name: 'timeout',
	type: 'number',
	typeOptions: {
		minValue: 0,
	},
	default: 0,
	description:
		'等待服务器发送响应头（并开始响应体）的时间（毫秒），超过此时间将中止请求。0 表示不限制超时。',
};

/**
 * 通用选项集合（包含批处理和超时）
 * 用于非分页操作
 */
export const commonOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add option',
	default: {},
	options: [batchingOption, timeoutOption],
};

/**
 * 仅超时选项集合
 * 用于分页操作（分页操作不需要批处理）
 */
export const timeoutOnlyOptions: INodeProperties = {
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add option',
	default: {},
	options: [timeoutOption],
};

/**
 * 通用选项的类型定义
 * 用于在操作函数中解析选项参数
 */
export interface ICommonOptionsValue {
	batching?: {
		batch?: {
			batchSize?: number;
			batchInterval?: number;
		};
	};
	timeout?: number;
}

/**
 * 分页参数选项
 */
export const paginationOptions = {
	/**
	 * 返回所有结果选项
	 */
	returnAll: {
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	} as INodeProperties,

	/**
	 * 限制返回数量选项
	 * @param maxValue 最大值，默认 100
	 */
	limit: (maxValue = 100): INodeProperties => ({
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue,
		},
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	}),

	/**
	 * 分页标记选项
	 */
	pageToken: {
		displayName: '分页标记',
		name: 'page_token',
		// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
		type: 'string',
		default: '',
		description:
			'分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会返回新的 page_token。',
	} as INodeProperties,

	/**
	 * 每页数量选项
	 * @param defaultValue 默认值
	 * @param maxValue 最大值
	 */
	pageSize: (defaultValue = 20, maxValue = 100): INodeProperties => ({
		displayName: '每页数量',
		name: 'page_size',
		type: 'number',
		default: defaultValue,
		typeOptions: {
			minValue: 1,
			maxValue,
		},
		description: `一次请求返回的最大数量。最小值为 1，最大值为 ${maxValue}。`,
	}),
};
