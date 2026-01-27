import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../help/utils/RequestUtils';

/**
 * 空间详情接口
 */
export interface ISpaceDetail {
	project_key: string;
	name: string;
	simple_name?: string;
	administrators?: string[];
}

/**
 * 工作项类型接口
 */
export interface IWorkItemType {
	type_key: string;
	name: string;
}

/**
 * 获取空间列表（返回空间ID数组）
 * 调用 /open_api/projects
 */
export async function getSpaceList(this: IExecuteFunctions): Promise<string[]> {
	const credentials = await this.getCredentials('feishuProjectApi');

	const body: IDataObject = {
		user_key: credentials.userId as string,
	};

	const response = await RequestUtils.request.call(this, {
		method: 'POST',
		url: '/open_api/projects',
		body,
	});

	// 返回空间ID数组
	if (Array.isArray(response)) {
		return response as string[];
	}

	return [];
}

/**
 * 获取空间详情
 * 调用 /open_api/projects/detail
 * @param projectKeys 空间ID数组（最多100个）
 */
export async function getSpaceDetails(
	this: IExecuteFunctions,
	projectKeys: string[],
): Promise<ISpaceDetail[]> {
	if (!projectKeys || projectKeys.length === 0) {
		return [];
	}

	// API 限制最多100个
	const limitedKeys = projectKeys.slice(0, 100);

	const credentials = await this.getCredentials('feishuProjectApi');

	const body: IDataObject = {
		project_keys: limitedKeys,
		user_key: credentials.userId as string,
	};

	const response = await RequestUtils.request.call(this, {
		method: 'POST',
		url: '/open_api/projects/detail',
		body,
	});

	// 返回空间详情数组
	if (response && typeof response === 'object') {
		return Object.values(response) as ISpaceDetail[];
	}

	return [];
}

/**
 * 获取工作项类型列表
 * 调用 /open_api/{project_key}/work_item/all-types
 * @param projectKey 空间ID
 */
export async function getWorkItemTypes(
	this: IExecuteFunctions,
	projectKey: string,
): Promise<IWorkItemType[]> {
	if (!projectKey) {
		return [];
	}

	const response = await RequestUtils.request.call(this, {
		method: 'GET',
		url: `/open_api/${projectKey}/work_item/all-types`,
	});

	// 返回工作项类型数组
	if (Array.isArray(response)) {
		return response as IWorkItemType[];
	}

	return [];
}
