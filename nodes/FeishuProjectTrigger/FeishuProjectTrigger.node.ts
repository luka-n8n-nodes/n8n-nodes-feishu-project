import { createHash } from 'crypto';
import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeConnectionTypes,
} from 'n8n-workflow';
import { Credentials } from '../help/type/enums';
import { getSpaceDetails, getSpaceList, ISpaceDetail } from '../FeishuProject/GenericFunctions';

/**
 * 飞书项目回调事件选项
 * 事件编码与名称参考飞书项目「监听事件配置」文档
 * 第一个为通配符，表示监听所有事件
 */
const EVENT_OPTIONS: Array<{ name: string; value: string }> = [
	{ name: '所有事件 (*)', value: '*' },
	// 工作项 (100)
	{ name: '创建工作项 (1001)', value: '1001' },
	{ name: '删除工作项 (1002)', value: '1002' },
	{ name: '恢复工作项 (1004)', value: '1004' },
	{ name: '终止工作项 (1005)', value: '1005' },
	{ name: '模版升级 (1006)', value: '1006' },
	{ name: '修改字段 (1009)', value: '1009' },
	// 节点 (200)
	{ name: '完成节点 (2001)', value: '2001' },
	{ name: '删除节点 (2002)', value: '2002' },
	{ name: '恢复节点 (2003)', value: '2003' },
	{ name: '回滚节点 (2004)', value: '2004' },
	{ name: '修改估分与排期 (2005)', value: '2005' },
	{ name: '修改节点负责人 (2006)', value: '2006' },
	{ name: '修改实际工时 (2007)', value: '2007' },
	{ name: '多人确认节点流转事件 (2009)', value: '2009' },
	// 状态 (300)
	{ name: '状态变更 (3001)', value: '3001' },
	// 子任务 (400)
	{ name: '新建子任务 (4001)', value: '4001' },
	{ name: '删除子任务 (4002)', value: '4002' },
	{ name: '完成子任务 (4003)', value: '4003' },
	{ name: '取消完成子任务 (4004)', value: '4004' },
	{ name: '修改子任务负责人 (4005)', value: '4005' },
	{ name: '修改子任务估分 (4006)', value: '4006' },
	{ name: '修改子任务排期 (4007)', value: '4007' },
	{ name: '修改子任务实际工时 (4008)', value: '4008' },
	{ name: '修改子任务字段 (4009)', value: '4009' },
	// 空间 (500)
	{ name: '添加空间成员 (5001)', value: '5001' },
	{ name: '删除空间成员 (5002)', value: '5002' },
	{ name: '完成工作移交 (5003)', value: '5003' },
	{ name: '拒绝工作移交 (5004)', value: '5004' },
	// 插件 (600)
	{ name: '插件安装 (6001)', value: '6001' },
	{ name: '插件卸载 (6002)', value: '6002' },
	{ name: '插件更新 (6003)', value: '6003' },
	{ name: '插件购买 (6004)', value: '6004' },
];

/**
 * 解析「允许的工作项类型」输入值
 * 支持以下写法：
 * - 表达式数组 {{ ["issue","story"] }} —— n8n 已解析为数组
 * - JSON 数组字符串 ["issue","story"]
 * - 逗号分隔字符串 issue,story
 * 返回去重后的字符串数组；包含通配符 * 时返回 ['*']
 */
function parseAllowedList(value: unknown): string[] {
	let list: string[] = [];

	if (Array.isArray(value)) {
		list = value.map((item) => String(item).trim());
	} else if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed !== '') {
			if (trimmed.startsWith('[')) {
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed)) {
						list = parsed.map((item) => String(item).trim());
					}
				} catch {
					list = trimmed.split(',').map((item) => item.trim());
				}
			} else {
				list = trimmed.split(',').map((item) => item.trim());
			}
		}
	}

	list = list.filter((item) => item !== '');

	if (list.includes('*')) {
		return ['*'];
	}

	return list;
}

export class FeishuProjectTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: '监听事件 Trigger',
		name: 'feishuProjectTrigger',
		icon: 'file:icon.svg',
		group: ['trigger'],
		version: [1],
		defaultVersion: 1,
		description: '当飞书项目发生指定事件时，通过 Webhook 回调触发工作流',
		defaults: {
			name: '监听事件',
		},
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: Credentials.FeishuProjectApi,
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: '将上方生成的 Webhook URL 填入飞书项目对应的回调地址中：',
				name: 'noticeTitle',
				type: 'notice',
				default: '',
			},
			{
				displayName:
					'1. 工作项 / 节点 / 状态 / 子任务 / 空间等业务事件（100~500）：开发者后台 → 插件功能 → 插件构成 添加构成 → 监听事件',
				name: 'noticeBusiness',
				type: 'notice',
				default: '',
			},
			{
				displayName:
					'2. 插件安装 / 卸载 / 更新 / 购买等插件事件（600）：开发者后台 → 插件发布 → 插件事件订阅',
				name: 'noticePlugin',
				type: 'notice',
				default: '',
			},
			{
				displayName: '监听事件',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['*'],
				description: '选择需要监听的事件，选择「所有事件」时将接收全部回调',
				options: EVENT_OPTIONS,
			},
			{
				displayName: '验证签名',
				name: 'verifySignature',
				type: 'boolean',
				default: false,
				description: 'Whether to verify the signature in the callback request to ensure it comes from Feishu Project',
			},
			{
				displayName: '回调 Token',
				name: 'callbackToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description:
					'飞书项目「监听事件配置」中的回调 Token，用于签名校验。可在开发者后台插件构成页面查看。',
				displayOptions: {
					show: {
						verifySignature: [true],
					},
				},
			},
			{
				displayName: '选项',
				name: 'options',
				type: 'collection',
				placeholder: '添加选项',
				default: {},
				options: [
					{
						displayName: '允许来源类型',
						name: 'allowedSources',
						type: 'multiOptions',
						default: [],
						description:
							'仅放行指定来源类型的回调，留空则不限制来源',
						options: [
							{
								name: '普通用户操作',
								value: 'normal',
								description: '该操作来自普通用户操作',
							},
							{
								name: 'OpenAPI',
								value: 'openapi',
								description: '该操作来自于 OpenAPI',
							},
							{
								name: '系统行为',
								value: 'system',
								description: '该操作来自于系统行为',
							},
							{
								name: '自动化',
								value: 'automation',
								description: '该操作来自自动化',
							},
						],
					},
					{
						displayName: '允许飞书项目空间 Names or IDs',
						name: 'allowedSpaces',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'loadSpacesWithWildcard',
						},
						default: ['*'],
						description: '仅放行指定飞书项目空间的回调，默认通配符表示不限制空间。使用 data.project_key 进行匹配。. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: '允许的工作项类型',
						name: 'allowedWorkItemTypes',
						type: 'string',
						default: '*',
						description:
							'仅放行指定工作项类型的回调，默认通配符 * 表示全部允许。支持逗号分隔、JSON 数组或表达式数组，例如 ["issue","story"]、issue,story 或 {{ ["issue","story"] }}。使用 data.work_item_type_key 进行匹配。',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			/**
			 * 加载空间列表选项（含通配符）
			 * 第一个为通配符，表示所有空间
			 */
			async loadSpacesWithWildcard(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const wildcard: INodePropertyOptions = {
					name: '所有空间 (*)',
					value: '*',
				};

				try {
					const spaceIds = await getSpaceList.call(this as unknown as IExecuteFunctions);

					if (!spaceIds || spaceIds.length === 0) {
						return [wildcard];
					}

					const spaceDetails = await getSpaceDetails.call(
						this as unknown as IExecuteFunctions,
						spaceIds,
					);

					return [
						wildcard,
						...spaceDetails.map((space: ISpaceDetail) => ({
							name: `${space.name} (${space.project_key})`,
							value: space.project_key as string,
						})),
					];
				} catch {
					return [wildcard];
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const res = this.getResponseObject();

		const events = this.getNodeParameter('events', []) as string[];
		const verifySignature = this.getNodeParameter('verifySignature', false) as boolean;
		const options = this.getNodeParameter('options', {}) as {
			allowedSources?: string[];
			allowedSpaces?: string[];
			allowedWorkItemTypes?: string | string[];
		};

		// 1. 签名校验：将 plugin_id + request_time + token 按顺序拼接后 sha256，比对 signature
		if (verifySignature) {
			const callbackToken = this.getNodeParameter('callbackToken', '') as string;
			const credentials = await this.getCredentials(Credentials.FeishuProjectApi);
			const pluginId = (credentials.pluginId as string) ?? '';
			const requestTime = body.request_time ?? '';

			const expectedSignature = createHash('sha256')
				.update(`${pluginId}${requestTime}${callbackToken}`, 'utf-8')
				.digest('hex');

			if (expectedSignature !== body.signature) {
				res.status(401).json({ error: 'Invalid signature' });
				return { noWebhookResponse: true };
			}
		}

		// 2. 来源过滤：配置了允许来源类型时，仅放行指定 source
		const allowedSources = options.allowedSources ?? [];
		if (
			allowedSources.length > 0 &&
			body.source !== undefined &&
			!allowedSources.includes(String(body.source))
		) {
			res.status(200).json({ code: 0, msg: 'ignored' });
			return { noWebhookResponse: true };
		}

		const data = (body.data as IDataObject) ?? {};

		// 3. 事件过滤：未选择通配符时，仅放行已订阅的 event_type
		const eventType = data.event_type;
		const isWildcard = events.includes('*');
		if (!isWildcard && eventType !== undefined && !events.includes(String(eventType))) {
			res.status(200).json({ code: 0, msg: 'ignored' });
			return { noWebhookResponse: true };
		}

		// 4. 空间过滤：未选择通配符时，仅放行指定 project_key 的回调
		const allowedSpaces = options.allowedSpaces ?? [];
		if (
			allowedSpaces.length > 0 &&
			!allowedSpaces.includes('*') &&
			data.project_key !== undefined &&
			!allowedSpaces.includes(String(data.project_key))
		) {
			res.status(200).json({ code: 0, msg: 'ignored' });
			return { noWebhookResponse: true };
		}

		// 5. 工作项类型过滤：未配置通配符时，仅放行指定 work_item_type_key 的回调
		//    部分事件可能不存在该字段（如插件/空间事件），此时视为通过
		const allowedWorkItemTypes = parseAllowedList(options.allowedWorkItemTypes);
		if (
			allowedWorkItemTypes.length > 0 &&
			!allowedWorkItemTypes.includes('*') &&
			data.work_item_type_key !== undefined &&
			!allowedWorkItemTypes.includes(String(data.work_item_type_key))
		) {
			res.status(200).json({ code: 0, msg: 'ignored' });
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
