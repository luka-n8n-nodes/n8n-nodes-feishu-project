import { INodeProperties } from 'n8n-workflow';

/**
 * 通用字段描述定义
 * 这些描述可以在多个资源操作中复用
 */
export const DESCRIPTIONS = {
	/**
	 * 空间选择器（支持列表选择和手动输入）
	 * 数据来源：SpaceListOperate + SpaceDetailOperate 组合
	 */
	PROJECT_KEY: {
		displayName: '空间',
		name: 'project_key',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description: '选择飞书项目空间。可以从列表选择或手动输入 project_key。',
		modes: [
			{
				displayName: '从列表选择',
				name: 'list',
				type: 'list',
				placeholder: '选择空间',
				typeOptions: {
					searchListMethod: 'searchSpaces',
					searchFilterRequired: false,
					searchable: false,
				},
			},
			{
				displayName: 'Project Key',
				name: 'id',
				type: 'string',
				placeholder: '输入 Project Key',
				default: '',
			},
		],
	} as INodeProperties,

	/**
	 * 空间选择器（可选，非必填）
	 */
	PROJECT_KEY_OPTIONAL: {
		displayName: '空间',
	name: 'project_key',
	type: 'resourceLocator',
	default: { mode: 'id', value: '' },
	description: '选择飞书项目空间。可以从列表选择或手动输入 project_key。',
		modes: [
			{
				displayName: '从列表选择',
				name: 'list',
				type: 'list',
				placeholder: '选择空间',
				typeOptions: {
					searchListMethod: 'searchSpaces',
					searchFilterRequired: false,
					searchable: false,
				},
			},
			{
				displayName: 'Project Key',
				name: 'id',
				type: 'string',
				placeholder: '输入 Project Key',
				default: '',
			},
		],
	} as INodeProperties,

	/**
	 * 工作项类型选择器
	 * 依赖：需要先选择空间（project_key）
	 */
	WORK_ITEM_TYPE_KEY: {
		displayName: '工作项类型',
		name: 'work_item_type_key',
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		required: true,
		description: '选择工作项类型。需要先选择空间。',
		modes: [
			{
				displayName: '从列表选择',
				name: 'list',
				type: 'list',
				placeholder: '选择工作项类型',
				typeOptions: {
					searchListMethod: 'searchWorkItemTypes',
					searchFilterRequired: false,
					searchable: false,
				},
			},
			{
				displayName: 'Type Key',
				name: 'id',
				type: 'string',
				placeholder: '输入工作项类型 Key',
				default: '',
			},
		],
	} as INodeProperties,

	/**
	 * 工作项ID
	 */
	WORK_ITEM_ID: {
		displayName: '工作项 ID',
		name: 'work_item_id',
		type: 'string',
		required: true,
		default: '',
		description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
	} as INodeProperties,

	/**
	 * 用户 Key
	 */
	USER_KEY: {
		displayName: '用户 Key',
		name: 'user_key',
		type: 'string',
		default: '',
		description: '用户的唯一标识符。留空则使用凭证中的 user_key。',
	} as INodeProperties,
};

/**
 * 获取空间选择器描述（可自定义覆盖属性）
 */
export function getProjectKeyDescription(overrides: Partial<INodeProperties> = {}): INodeProperties {
	return {
		...DESCRIPTIONS.PROJECT_KEY,
		...overrides,
	} as INodeProperties;
}

/**
 * 获取工作项类型选择器描述（可自定义覆盖属性）
 */
export function getWorkItemTypeKeyDescription(overrides: Partial<INodeProperties> = {}): INodeProperties {
	return {
		...DESCRIPTIONS.WORK_ITEM_TYPE_KEY,
		...overrides,
	} as INodeProperties;
}
