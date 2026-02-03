import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
} from 'n8n-workflow';
import ResourceFactory from '../help/builder/ResourceFactory';
import { configuredOutputs } from '../help/utils/parameters';
import { Credentials, OutputType } from '../help/type/enums';
import { OperationResult, OperationCallFunction } from '../help/type/IResource';
import { ICommonOptionsValue } from '../help/utils/sharedOptions';
import {
	getSpaceList,
	getSpaceDetails,
	getWorkItemTypes,
	getWorkItemFieldMeta,
	getWorkItemFieldsAll,
	ISpaceDetail,
	IWorkItemType,
	IWorkItemFieldMeta,
	IWorkItemField,
} from './GenericFunctions';

const resourceBuilder = ResourceFactory.build(__dirname);

/**
 * 批次配置接口
 */
interface IBatchConfig {
	/** 是否启用并发模式（用户是否显式添加了 Batching 选项） */
	enabled: boolean;
	/** 每批请求数量 */
	batchSize: number;
	/** 批次间隔（毫秒） */
	batchInterval: number;
}

/**
 * 多输出响应类型
 */
interface IMultipleOutputResponse {
	outputType: OutputType;
	outputData?: INodeExecutionData[][];
}

/**
 * 请求结果类型（用于并发执行）
 */
interface IRequestResult {
	itemIndex: number;
	result?: OperationResult;
	error?: Error;
}

/**
 * 从 options 参数中获取批次配置
 */
function getBatchConfig(context: IExecuteFunctions): IBatchConfig {
	try {
		const options = context.getNodeParameter('options', 0, {}) as ICommonOptionsValue;

		// 检查用户是否显式添加了 Batching 选项
		const batchingEnabled = options?.batching?.batch !== undefined;
		const batchSize = options?.batching?.batch?.batchSize ?? 50;
		const batchInterval = options?.batching?.batch?.batchInterval ?? 0;

		return {
			enabled: batchingEnabled,
			// batchSize 为 0 时视为 1
			batchSize: batchSize === 0 ? 1 : batchSize,
			batchInterval,
		};
	} catch {
		// 如果获取参数失败（例如操作不支持 options），返回默认配置（串行模式）
		return { enabled: false, batchSize: 50, batchInterval: 0 };
	}
}

/**
 * 获取错误信息
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

/**
 * 获取错误堆栈
 */
function getErrorStack(error: unknown): string | undefined {
	if (error instanceof Error) {
		return error.stack;
	}
	return undefined;
}

/**
 * 检查响应是否为多输出类型
 */
function isMultipleOutputResponse(response: OperationResult): response is IMultipleOutputResponse {
	return (
		response !== null &&
		typeof response === 'object' &&
		'outputType' in response &&
		(response as IMultipleOutputResponse).outputType !== undefined
	);
}

/**
 * 处理单个响应数据
 * @returns 处理后的执行数据，如果是特殊输出类型则返回 null
 */
function processResponseData(
	context: IExecuteFunctions,
	responseData: OperationResult,
	itemIndex: number,
): { data: INodeExecutionData[] | null; multipleOutput?: INodeExecutionData[][] } {
	// 检查是否有自定义输出类型
	if (isMultipleOutputResponse(responseData)) {
		const { outputType, outputData } = responseData;

		if (outputType === OutputType.Multiple && outputData) {
			// 多输出模式：返回输出数据
			return { data: null, multipleOutput: outputData };
		}

		if (outputType === OutputType.None) {
			// 无输出模式
			return { data: null };
		}
	}

	// 默认单输出模式
	const executionData = context.helpers.constructExecutionMetaData(
		context.helpers.returnJsonArray(responseData as IDataObject),
		{ itemData: { item: itemIndex } },
	);

	return { data: executionData };
}

/**
 * 创建错误输出数据
 */
function createErrorData(
	context: IExecuteFunctions,
	error: unknown,
	itemIndex: number,
): INodeExecutionData[] {
	const errorObj = error as any;
	return context.helpers.constructExecutionMetaData(
		context.helpers.returnJsonArray({
			error: errorObj.description ?? getErrorMessage(error),
			...(errorObj.name === 'NodeApiError' && errorObj.cause?.error
				? { details: errorObj.cause.error }
				: {}),
		}),
		{ itemData: { item: itemIndex } },
	);
}

/**
 * 串行执行模式（原有逻辑，向后兼容）
 */
async function executeSerial(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	callFunc: OperationCallFunction,
	resource: string,
	operation: string,
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[][] = [[]];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {
			context.logger.debug('call function (serial)', {
				resource,
				operation,
				itemIndex,
			});

			const responseData = await callFunc.call(context, itemIndex);
			const processed = processResponseData(context, responseData, itemIndex);

			if (processed.multipleOutput) {
				// 多输出模式：直接返回
				return processed.multipleOutput;
			}

			if (processed.data === null && !processed.multipleOutput) {
				// 无输出模式
				return [];
			}

			if (processed.data) {
				returnData[0].push(...processed.data);
			}
		} catch (error) {
			context.logger.error('call function error (serial)', {
				resource,
				operation,
				itemIndex,
				errorMessage: getErrorMessage(error),
				stack: getErrorStack(error),
			});

			if (context.continueOnFail()) {
				returnData[0].push(...createErrorData(context, error, itemIndex));
				continue;
			}
			throw error;
		}
	}

	return returnData;
}

/**
 * 并发执行模式（类似 HttpRequest 节点）
 * 每批请求同时发送，批间有间隔
 */
async function executeParallel(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	callFunc: OperationCallFunction,
	batchConfig: IBatchConfig,
	resource: string,
	operation: string,
): Promise<INodeExecutionData[][]> {
	const { batchSize, batchInterval } = batchConfig;
	const requestPromises: Promise<IRequestResult>[] = [];
	const returnData: INodeExecutionData[][] = [[]];

	// 阶段1：创建所有请求 Promise（带批次延迟）
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		// 批次延迟：在每批开始前等待（第一批除外）
		if (itemIndex > 0 && batchSize > 0 && batchInterval > 0) {
			if (itemIndex % batchSize === 0) {
				await sleep(batchInterval);
			}
		}

		context.logger.debug('call function (parallel)', {
			resource,
			operation,
			itemIndex,
			batch: batchSize > 0 ? Math.floor(itemIndex / batchSize) : 0,
		});

		// 创建请求 Promise（立即开始执行，不等待）
		const requestPromise = callFunc
			.call(context, itemIndex)
			.then((result): IRequestResult => ({ itemIndex, result }))
			.catch((error): IRequestResult => ({ itemIndex, error: error as Error }));

		requestPromises.push(requestPromise);
	}

	// 阶段2：等待所有请求完成
	const promisesResponses = await Promise.allSettled(requestPromises);

	// 阶段3：按原始顺序处理结果
	for (let i = 0; i < promisesResponses.length; i++) {
		const response = promisesResponses[i];

		if (response.status === 'rejected') {
			// Promise 本身被 reject（不应该发生，因为我们在上面已经 catch 了）
			const error = response.reason as Error;
			context.logger.error('call function error (parallel - rejected)', {
				resource,
				operation,
				itemIndex: i,
				errorMessage: getErrorMessage(error),
			});

			if (context.continueOnFail()) {
				returnData[0].push(...createErrorData(context, error, i));
				continue;
			}
			throw error;
		}

		const { itemIndex, result, error } = response.value;

		if (error) {
			// 请求执行出错
			context.logger.error('call function error (parallel)', {
				resource,
				operation,
				itemIndex,
				errorMessage: error.message,
				stack: error.stack,
			});

			if (context.continueOnFail()) {
				returnData[0].push(...createErrorData(context, error, itemIndex));
				continue;
			}
			throw error;
		}

		if (result === undefined) {
			continue;
		}

		// 处理成功的响应
		const processed = processResponseData(context, result, itemIndex);

		if (processed.multipleOutput) {
			// 多输出模式：直接返回（注意：在并发模式下，多输出可能会有问题）
			return processed.multipleOutput;
		}

		if (processed.data === null && !processed.multipleOutput) {
			// 无输出模式：跳过
			continue;
		}

		if (processed.data) {
			returnData[0].push(...processed.data);
		}
	}

	return returnData;
}

export class FeishuProject implements INodeType {
	description: INodeTypeDescription = {
		displayName: '飞书项目',
		subtitle: '={{ $parameter.resource }}:{{ $parameter.operation }}',
		name: 'feishuProject',
		icon: 'file:icon.svg',
		group: ['transform'],
		version: [1],
		defaultVersion: 1,
		description: '飞书项目管理 API 集成，支持工作项、空间、用户、工作流等完整功能',
		defaults: {
			name: '飞书项目',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: `={{(${configuredOutputs})($parameter)}}`,
		credentials: [
			{
				name: Credentials.FeishuProjectApi,
				required: true,
			},
		],
		properties: [...resourceBuilder.build()],
	};

	methods = {
		listSearch: {
			/**
			 * 搜索空间列表
			 * 数据来源：SpaceListOperate + SpaceDetailOperate 组合
			 * 1. 调用 /open_api/projects 获取空间ID列表
			 * 2. 使用空间ID调用 /open_api/projects/detail 获取空间详情
			 * 3. 返回 name + project_key 格式的列表
			 */
			async searchSpaces(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				// 获取空间ID列表
				const spaceIds = await getSpaceList.call(this as unknown as IExecuteFunctions);

				if (!spaceIds || spaceIds.length === 0) {
					return { results: [] };
				}

				// 获取空间详情
				const spaceDetails = await getSpaceDetails.call(
					this as unknown as IExecuteFunctions,
					spaceIds,
				);

				// 格式化返回结果
				return {
					results: spaceDetails.map((space: ISpaceDetail) => ({
						name: space.name as string,
						value: space.project_key as string,
					})),
				};
			},

			/**
			 * 搜索工作项类型列表
			 * 依赖：需要先选择空间（project_key）
			 */
			async searchWorkItemTypes(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
				const projectKey = this.getNodeParameter('project_key', undefined, {
					extractValue: true,
				}) as string;

				if (!projectKey) {
					throw new NodeOperationError(this.getNode(), '请先选择空间');
				}

				const workItemTypes = await getWorkItemTypes.call(
					this as unknown as IExecuteFunctions,
					projectKey,
				);

				return {
					results: workItemTypes.map((type: IWorkItemType) => ({
						name: type.name as string,
						value: type.type_key as string,
					})),
				};
			},
		},
		loadOptions: {
			/**
			 * 加载空间列表选项（用于 multiOptions 字段）
			 */
			async loadSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// 获取空间ID列表
					const spaceIds = await getSpaceList.call(this as unknown as IExecuteFunctions);

					if (!spaceIds || spaceIds.length === 0) {
						return [];
					}

					// 获取空间详情
					const spaceDetails = await getSpaceDetails.call(
						this as unknown as IExecuteFunctions,
						spaceIds,
					);

					return spaceDetails.map((space: ISpaceDetail) => ({
						name: `${space.name} (${space.project_key})`,
						value: space.project_key as string,
					}));
				} catch {
					return [];
				}
			},
			/**
			 * 加载工作项类型选项（用于 multiOptions 字段）
			 * 依赖：需要先选择空间（project_key）
			 */
			async loadWorkItemTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const projectKey = this.getNodeParameter('project_key', undefined, {
						extractValue: true,
					}) as string;

					if (!projectKey) {
						return [];
					}

					const workItemTypes = await getWorkItemTypes.call(
						this as unknown as IExecuteFunctions,
						projectKey,
					);

					return workItemTypes.map((type: IWorkItemType) => ({
						name: type.name as string,
						value: type.type_key as string,
					}));
				} catch {
					return [];
				}
			},
			/**
			 * 加载工作项字段列表选项
			 * 依赖：需要先选择空间（project_key）和工作项类型（work_item_type_key）
			 */
			async loadWorkItemFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// 需要过滤掉的字段类型列表
				const excludedFieldTypes = [
					'multi_file', // 附件
				];

				try {
					// project_key 是 resourceLocator 类型，需要 extractValue
					const projectKey = this.getNodeParameter('project_key', undefined, {
						extractValue: true,
					}) as string;
					// work_item_type_key 是普通 options 类型，不需要 extractValue
					const workItemTypeKey = this.getNodeParameter('work_item_type_key') as string;

					if (!projectKey || !workItemTypeKey) {
						return [];
					}

					const fieldMeta = await getWorkItemFieldMeta.call(
						this as unknown as IExecuteFunctions,
						projectKey,
						workItemTypeKey,
					);

					return fieldMeta
						// 过滤掉不支持的字段类型
						.filter((field: IWorkItemFieldMeta) => !excludedFieldTypes.includes(field.field_type_key || ''))
						.map((field: IWorkItemFieldMeta) => ({
							name: `${field.field_name}${field.is_required === 1 ? ' *' : ''}`,
							value: field.field_key as string,
							description: `类型: ${field.field_type_key || '未知'}${field.is_required === 1 ? ' (必填)' : field.is_required === 3 ? ' (条件必填)' : ''}`,
						}));
				} catch {
					return [];
				}
			},
			/**
			 * 加载附件字段列表选项（仅返回 multi_file 类型）
			 * 依赖：需要先选择空间（project_key）和工作项类型（work_item_type_key）
			 */
			async loadAttachmentFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// project_key 是 resourceLocator 类型，需要 extractValue
					const projectKey = this.getNodeParameter('project_key', undefined, {
						extractValue: true,
					}) as string;
					// work_item_type_key 是普通 options 类型，不需要 extractValue
					const workItemTypeKey = this.getNodeParameter('work_item_type_key') as string;

					if (!projectKey || !workItemTypeKey) {
						return [];
					}

					const fieldMeta = await getWorkItemFieldMeta.call(
						this as unknown as IExecuteFunctions,
						projectKey,
						workItemTypeKey,
					);

					return fieldMeta
						// 只保留附件类型字段（multi_file）
						.filter((field: IWorkItemFieldMeta) => field.field_type_key === 'multi_file')
						.map((field: IWorkItemFieldMeta) => ({
							name: field.field_name as string,
							value: field.field_key as string,
						}));
				} catch {
					return [];
				}
			},
			/**
			 * 加载所有字段列表选项（使用 field/all 接口）
			 * 依赖：需要先选择空间（project_key）和工作项类型（work_item_type_key）
			 */
			async loadWorkItemFieldsAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// 需要过滤掉的字段类型列表
				const excludedFieldTypes = [
					'multi_file', // 附件
				];

				try {
					// project_key 是 resourceLocator 类型，需要 extractValue
					const projectKey = this.getNodeParameter('project_key', undefined, {
						extractValue: true,
					}) as string;
					// work_item_type_key 是普通 options 类型，不需要 extractValue
					const workItemTypeKey = this.getNodeParameter('work_item_type_key') as string;

					if (!projectKey || !workItemTypeKey) {
						return [];
					}

					const fields = await getWorkItemFieldsAll.call(
						this as unknown as IExecuteFunctions,
						projectKey,
						workItemTypeKey,
					);

					return fields
						// 过滤掉不支持的字段类型
						.filter((field: IWorkItemField) => !excludedFieldTypes.includes(field.field_type_key || ''))
						.map((field: IWorkItemField) => ({
							name: field.field_name as string,
							value: field.field_key as string,
							description: `类型: ${field.field_type_key || '未知'}${field.is_custom_field ? ' (自定义字段)' : ''}`,
						}));
				} catch {
					return [];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const callFunc = resourceBuilder.getCall(resource, operation);

		if (!callFunc) {
			throw new NodeOperationError(this.getNode(), `未实现方法: ${resource}.${operation}`);
		}

		// 获取批次配置
		const batchConfig = getBatchConfig(this);

		// 根据是否显式设置了 Batching 选项来选择执行策略：
		// - enabled === false（默认，未添加 Batching）：串行模式，逐个执行
		// - enabled === true（添加了 Batching）：并发模式，每批请求同时发送
		if (batchConfig.enabled) {
			// 并发模式：类似 HttpRequest 节点
			return executeParallel(this, items, callFunc, batchConfig, resource, operation);
		}

		// 串行模式：原有逻辑（向后兼容）
		return executeSerial(this, items, callFunc, resource, operation);
	}
}
