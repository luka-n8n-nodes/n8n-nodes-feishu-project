import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const UserGroupCreateOperate: ResourceOperations = {
	name: '创建自定义用户组',
	value: 'user_group:create',
	order: 30,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '用户组名称',
			name: 'name',
			type: 'string',
			required: true,
			default: '',
			description: '用户组名称。不能和已存在的用户组名称以及系统用户组名称重复（空间管理员、Space administrators、空间成员、Space members等等）。不能存在特殊字符，如"/"等，长度不能超过250个字符。',
		},
		{
			displayName: '用户列表',
			name: 'users',
			type: 'string',
			required: true,
			default: '',
			description: '用户组员工 userKey 列表，支持逗号分隔的字符串或数组。单次添加不能超过100个员工。当前仅支持用户成员，不能添加部门成员。',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const name = this.getNodeParameter('name', index) as string;
		const usersInput = this.getNodeParameter('users', index) as string | string[];

		// 验证名称长度
		if (name.length > 250) {
			throw new Error('用户组名称长度不能超过250个字符');
		}

		// 验证名称不包含特殊字符
		if (name.includes('/')) {
			throw new Error('用户组名称不能包含特殊字符，如"/"');
		}

		// 解析用户列表（兼容字符串和数组两种形式）
		let users: string[];
		if (Array.isArray(usersInput)) {
			users = usersInput.map(u => String(u).trim()).filter(u => u);
		} else {
			users = String(usersInput).split(',').map(u => u.trim()).filter(u => u);
		}

		// 验证用户数量
		if (users.length > 100) {
			throw new Error('单次添加不能超过100个员工');
		}

		if (users.length === 0) {
			throw new Error('用户列表不能为空');
		}

		const body: IDataObject = {
			name,
			users,
		};

		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/user_group`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default UserGroupCreateOperate;
