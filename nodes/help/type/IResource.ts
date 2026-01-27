import {
	INodePropertyOptions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
	type IExecuteFunctions,
} from 'n8n-workflow';
import { OutputType } from './enums';

/**
 * 操作返回结果类型
 * 支持单输出、多输出和自定义输出
 */
export type OperationResult =
	| IDataObject
	| IDataObject[]
	| {
			outputType: OutputType;
			outputData?: INodeExecutionData[][];
		};

/**
 * 操作调用函数类型
 */
export type OperationCallFunction = (
	this: IExecuteFunctions,
	index: number,
) => Promise<OperationResult>;

/**
 * 资源操作定义
 */
export type ResourceOperations = INodePropertyOptions & {
	/** 操作的参数选项列表 */
	options: INodeProperties[];
	/** 操作执行函数 */
	call?: OperationCallFunction;
	/** 排序顺序，默认 100 */
	order?: number;
};

/**
 * 资源选项定义
 */
export type ResourceOptions = INodePropertyOptions & {
	/** 排序顺序，默认 100 */
	order?: number;
};

/**
 * 资源接口定义
 */
export interface IResource extends INodePropertyOptions {
	/** 资源下的操作列表 */
	operations: ResourceOperations[];
}

/**
 * 资源选项（用于构建节点属性时移除 operations）
 */
export type ResourceOptionWithoutOperations = Omit<IResource, 'operations'> & {
	operations: null;
};

/**
 * 操作选项（用于构建节点属性时移除 options 和 call）
 */
export type OperationOptionWithoutDetails = Omit<ResourceOperations, 'options' | 'call'> & {
	options: null;
};
