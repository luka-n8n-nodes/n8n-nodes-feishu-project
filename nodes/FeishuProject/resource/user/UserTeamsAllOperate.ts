import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const UserTeamsAllOperate: ResourceOperations = {
	name: '获取空间下团队人员',
	value: 'user:teams_all',
	order: 50,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: {
				minValue: 1,
				maxValue: 300,
			},
			displayOptions: {
				show: {
					returnAll: [false],
				},
			},
			description: 'Max number of results to return',
		},
		{
			displayName: '获取所有用户详情',
			name: 'fetchUserDetails',
			type: 'boolean',
			default: false,
			description: 'Whether to automatically fetch details for all users, deduplicating user_keys across all teams and querying user info in bulk',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const fetchUserDetails = this.getNodeParameter('fetchUserDetails', index, false) as boolean;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const fetchPage = async (offset: number, pageLimit: number) => {
			const qs: IDataObject = {
				offset,
				limit: pageLimit,
			};

			const response = await RequestUtils.originRequest.call(this, {
				method: 'GET',
				url: `/open_api/${project_key}/teams/all`,
				qs,
				json: true,
				timeout: options.timeout,
			}) as any;

			if (response?.err_code !== 0) {
				throw new Error(`Feishu Project API Error: ${response?.err_code}, ${response?.err_msg}`);
			}

			return {
				data: response?.data || [],
				has_more: response?.has_more ?? false,
			};
		};

		let teamsData: any[];

		if (returnAll) {
			teamsData = [];
			let offset = 0;
			const pageSize = 300;

			while (true) {
				const { data, has_more } = await fetchPage(offset, pageSize);
				teamsData = teamsData.concat(data);

				if (!has_more || data.length === 0) {
					break;
				}

				offset++;
			}
		} else {
			const pageSize = Math.min(limit, 300);
			const { data } = await fetchPage(0, pageSize);
			teamsData = data.slice(0, limit);
		}

		if (!fetchUserDetails) {
			return teamsData;
		}

		// 合并所有团队的 user_keys 并去重
		const allUserKeys = new Set<string>();
		for (const team of teamsData) {
			if (Array.isArray(team.user_keys)) {
				for (const key of team.user_keys) {
					allUserKeys.add(key);
				}
			}
		}

		if (allUserKeys.size === 0) {
			return teamsData;
		}

		// 批量查询用户详情（每次最多100个）
		const userKeysArray = Array.from(allUserKeys);
		const userDetails: any[] = [];

		for (let i = 0; i < userKeysArray.length; i += 100) {
			const batch = userKeysArray.slice(i, i + 100);

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: '/open_api/user/query',
				body: { user_keys: batch },
				timeout: options.timeout,
			}) as any;

			if (Array.isArray(response)) {
				userDetails.push(...response);
			} else if (response?.data) {
				userDetails.push(...response.data);
			}
		}

		return {
			teams: teamsData,
			users: userDetails,
		} as unknown as IDataObject;
	},
};

export default UserTeamsAllOperate;
