import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const UserGetInfoOperate: ResourceOperations = {
	name: '查询用户信息',
	value: 'user:query',
	order: 4,
	options: [
		{
			displayName: '用户Key列表',
			name: 'user_keys',
			type: 'string',
			default: '',
			description: '飞书项目的 user_key 数组。开发者自己的 user_key 可在飞书项目空间左下角双击个人头像获取；租户内其他成员的 user_key 请通过搜索租户内的用户列表接口获取。user_keys、out_ids、emails 三个参数必须至少提供一个（最多100个）',
		},
		{
			displayName: 'UnionId列表',
			name: 'out_ids',
			type: 'string',
			default: '',
			description: '飞书开放平台的 UnionId 数组，用于标识同一应用服务商开发的多个应用中的统一身份。user_keys、out_ids、emails 三个参数必须至少提供一个（最多100个）',
		},
		{
			displayName: '邮箱列表',
			name: 'emails',
			type: 'string',
			default: '',
			description: '邮箱数组。通过邮箱查询时，需要确保邮箱已绑定飞书。user_keys、out_ids、emails 三个参数必须至少提供一个（最多100个）',
		},
		{
			displayName: '租户Key',
			name: 'tenant_key',
			type: 'string',
			default: '',
			description: '待查询用户所在飞书项目租户的 saas_tenant_key。此参数适用于邮箱查询场景。当查询非插件关联租户的用户时，此参数为必填。例如：租户X开发了插件A，租户Y安装了插件A，要查询租户Y的用户信息时，需要填写此参数。如果此参数为空，则视为查询插件关联租户下的用户信息',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const userKeys = this.getNodeParameter('user_keys', index) as string[] | string;
		const outIds = this.getNodeParameter('out_ids', index) as string[] | string;
		const emails = this.getNodeParameter('emails', index) as string[] | string;
		const tenantKey = this.getNodeParameter('tenant_key', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {};

		// 处理 user_keys：转换为数组，过滤空值
		const userKeysArray = Array.isArray(userKeys)
			? userKeys.filter((key: string) => key && key.trim())
			: (userKeys && userKeys.trim() ? [userKeys] : []);

		if (userKeysArray.length > 0) {
			body.user_keys = userKeysArray;
		}

		// 处理 out_ids：转换为数组，过滤空值
		const outIdsArray = Array.isArray(outIds)
			? outIds.filter((id: string) => id && id.trim())
			: (outIds && outIds.trim() ? [outIds] : []);

		if (outIdsArray.length > 0) {
			body.out_ids = outIdsArray;
		}

		// 处理 emails：转换为数组，过滤空值
		const emailsArray = Array.isArray(emails)
			? emails.filter((email: string) => email && email.trim())
			: (emails && emails.trim() ? [emails] : []);

		if (emailsArray.length > 0) {
			body.emails = emailsArray;
		}

		// 验证：user_keys、out_ids、emails 三个参数必须至少提供一个
		if (userKeysArray.length === 0 && outIdsArray.length === 0 && emailsArray.length === 0) {
			throw new Error('user_keys、out_ids、emails 三个参数必须至少提供一个');
		}

		// 如果提供了 tenant_key，则添加到 body 中
		if (tenantKey && tenantKey.trim()) {
			body.tenant_key = tenantKey.trim();
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/user/query`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default UserGetInfoOperate;
