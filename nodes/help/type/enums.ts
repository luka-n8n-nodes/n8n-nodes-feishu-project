/**
 * 资源类型枚举
 */
export declare const enum ResourceType {
	Space = 'space',
	WorkItem = 'workItem',
	User = 'user',
	Attachment = 'attachment',
	Comment = 'comment',
	// 可以根据飞书项目的其他资源类型继续添加
}

/**
 * 操作类型枚举
 */
export declare const enum OperationType {
	// 空间操作
	SpaceList = 'spaceList',
	SpaceDetail = 'spaceDetail',
	// 工作项操作
	WorkItemCreate = 'workItemCreate',
	WorkItemUpdate = 'workItemUpdate',
	WorkItemDelete = 'workItemDelete',
	// 可以根据飞书项目的其他操作类型继续添加
}

/**
 * 输出类型枚举
 */
export declare const enum OutputType {
	Single = 'single',
	Multiple = 'multiple',
	None = 'none',
}

/**
 * 凭证类型枚举
 */
export declare const enum Credentials {
	FeishuProjectApi = 'feishuProjectApi',
}

/**
 * 飞书项目 API 错误码常量
 * 参考文档: https://project.feishu.cn/b/helpcenter/1p8d7djs/5aueo3jr
 */
export const FeishuProjectErrorCodes = {
	/** Plugin Token 已过期 */
	PLUGIN_TOKEN_EXPIRED: 10022,
	/** 用户未找到 */
	USER_NOT_FOUND: 30006,
	/** 参数错误 */
	INVALID_PARAMETER: 30001,
	/** 权限不足 */
	PERMISSION_DENIED: 30002,
	/** 资源不存在 */
	RESOURCE_NOT_FOUND: 30003,
	/** 空间不存在 */
	SPACE_NOT_FOUND: 30004,
	/** 工作项不存在 */
	WORK_ITEM_NOT_FOUND: 30005,
	/** 请求频率超限 */
	RATE_LIMITED: 30007,
	/** 内部错误 */
	INTERNAL_ERROR: 50000,
} as const;

/**
 * 可自动重试的错误码列表
 */
export const RETRYABLE_ERROR_CODES: readonly number[] = [
	FeishuProjectErrorCodes.PLUGIN_TOKEN_EXPIRED,
	FeishuProjectErrorCodes.RATE_LIMITED,
] as const;

/**
 * 飞书项目 API 错误码帮助文档 URL
 */
export const ERROR_HELP_URL = 'https://project.feishu.cn/b/helpcenter/1p8d7djs/5aueo3jr';
