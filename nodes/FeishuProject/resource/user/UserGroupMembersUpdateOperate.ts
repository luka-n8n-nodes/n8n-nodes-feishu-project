import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const UserGroupMembersUpdateOperate: ResourceOperations = {
	name: '更新用户组成员',
	value: 'user_group:members_update',
	order: 20,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '用户组类型',
			name: 'user_group_type',
			type: 'options',
			required: true,
			options: [
				{
					name: '空间成员',
					value: 'PROJECT_MEMBER',
				},
				{
					name: '自定义用户组',
					value: 'CUSTOMIZE',
				},
			],
			default: 'PROJECT_MEMBER'
		},
		{
			displayName: '用户组ID',
			name: 'user_group_id',
			type: 'string',
			required: true,
			default: '',
			displayOptions: {
				show: {
					user_group_type: ['CUSTOMIZE'],
				},
			},
			description: '用户组 ID，当用户组类型为"自定义用户组"时必填。在该用户组页面 URL 中获取，例如 URL 为 "https://project.feishu.cn/intxxxx/setting/userGroup/756472096042365xxxx"，则 user_group_id 为 "756472096042365xxxx"。',
		},
		{
			displayName: '待添加成员',
			name: 'add_users',
			type: 'string',
			default: '',
			description: '待添加成员列表，成员标识为 user_key，支持逗号分隔的字符串或数组。不能添加已离职或不存在的员工，单次添加不能超过100个员工。注意：add_users、delete_users、replace_users 三个字段不能同时为空。',
		},
		{
			displayName: '待删除成员',
			name: 'delete_users',
			type: 'string',
			default: '',
			description: '待删除成员列表，成员标识为 user_key，支持逗号分隔的字符串或数组。单次删除不能超过100个员工。注意：add_users 和 delete_users 存在相同的 user_key 时，则忽略这个 user_key。',
		},
		{
			displayName: '替换全部成员',
			name: 'replace_users',
			type: 'string',
			default: '',
			description: '全部覆盖已有用户组成员信息，成员标识为 user_key，支持逗号分隔的字符串或数组。单次设置不能超过100个员工，若需添加100个员工以上，请用"待添加成员"方式继续添加。注意：此字段不为空时，忽略 add_users、delete_users 参数。',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const user_group_type = this.getNodeParameter('user_group_type', index) as string;
		const user_group_id = user_group_type === 'CUSTOMIZE'
			? this.getNodeParameter('user_group_id', index) as string
			: '';
		const addUsersInput = this.getNodeParameter('add_users', index, '') as string | string[];
		const deleteUsersInput = this.getNodeParameter('delete_users', index, '') as string | string[];
		const replaceUsersInput = this.getNodeParameter('replace_users', index, '') as string | string[];

		// 解析用户列表（兼容字符串和数组两种形式）
		const parseUsers = (input: string | string[]): string[] => {
			if (Array.isArray(input)) {
				return input.map(u => String(u).trim()).filter(u => u);
			}
			return String(input).split(',').map(u => u.trim()).filter(u => u);
		};

		const add_users = parseUsers(addUsersInput);
		const delete_users = parseUsers(deleteUsersInput);
		const replace_users = parseUsers(replaceUsersInput);

		// 验证：三个字段不能同时为空
		if (add_users.length === 0 && delete_users.length === 0 && replace_users.length === 0) {
			throw new Error('add_users、delete_users、replace_users 三个字段不能同时为空');
		}

		// 验证：每个列表不能超过100个
		if (add_users.length > 100) {
			throw new Error('待添加成员单次不能超过100个员工');
		}
		if (delete_users.length > 100) {
			throw new Error('待删除成员单次不能超过100个员工');
		}
		if (replace_users.length > 100) {
			throw new Error('替换全部成员单次设置不能超过100个员工');
		}

		// 验证：CUSTOMIZE 类型必须提供 user_group_id
		if (user_group_type === 'CUSTOMIZE' && !user_group_id) {
			throw new Error('自定义用户组类型必须提供用户组ID');
		}

		const body: IDataObject = {
			user_group_type,
		};

		if (user_group_id) {
			body.user_group_id = user_group_id;
		}
		if (add_users.length > 0) {
			body.add_users = add_users;
		}
		if (delete_users.length > 0) {
			body.delete_users = delete_users;
		}
		if (replace_users.length > 0) {
			body.replace_users = replace_users;
		}

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'PATCH',
			url: `/open_api/${project_key}/user_group/members`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default UserGroupMembersUpdateOperate;
