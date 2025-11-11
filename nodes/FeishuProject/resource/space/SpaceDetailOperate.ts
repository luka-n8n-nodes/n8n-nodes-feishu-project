import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const SpaceDetailOperate: ResourceOperations = {
	name: '获取空间详情',
	value: 'space:detail',
	options: [
		{
			displayName: '项目Key列表',
			name: 'project_keys',
			type: 'string',
			default: '',
			description: '安装插件的飞书项目空间 (project_key) 列表，上限是100个。project_key 在飞书项目空间双击空间名称获取。project_keys 和 simple_names 不可同时为空。',
		},
		{
			displayName: '空间名称列表',
			name: 'simple_names',
			type: 'string',
			default: '',
			description: '安装插件的飞书项目空间 (simple_name) 列表。simple_name 一般在飞书项目空间 URL 中获取。例如空间 URL为"https://project.feishu.cn/doc/overview"，则 simple_name 为"doc"。project_keys 和 simple_names 不可同时为空。',
		},
		{
			displayName: '用户标识',
			name: 'user_key',
			type: 'string',
			default: '',
			description: '指定查询用户，当用户为空间管理员时，返回该空间的管理员信息。留空时将使用凭据中的用户ID。开发者自己的 user_key 可在飞书项目空间左下角双击个人头像获取；租户内其他成员的 user_key 请通过搜索租户内的用户列表接口获取。',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const projectKeys = this.getNodeParameter('project_keys', index) as string[] | string;
		const simpleNames = this.getNodeParameter('simple_names', index) as string[] | string;
		const userKey = this.getNodeParameter('user_key', index) as string;

		const body: IDataObject = {};

		// 处理 project_keys：转换为数组，过滤空值
		const projectKeysArray = Array.isArray(projectKeys)
			? projectKeys.filter((key: string) => key && key.trim())
			: (projectKeys && projectKeys.trim() ? [projectKeys] : []);

		if (projectKeysArray.length > 0) {
			body.project_keys = projectKeysArray;
		}

		// 处理 simple_names：转换为数组，过滤空值
		const simpleNamesArray = Array.isArray(simpleNames)
			? simpleNames.filter((name: string) => name && name.trim())
			: (simpleNames && simpleNames.trim() ? [simpleNames] : []);

		if (simpleNamesArray.length > 0) {
			body.simple_names = simpleNamesArray;
		}

		// 验证：project_keys 和 simple_names 不可同时为空
		if (projectKeysArray.length === 0 && simpleNamesArray.length === 0) {
			throw new Error('project_keys 和 simple_names 不可同时为空，请至少填写其中一个参数');
		}

		// 如果用户没有提供user_key，则使用凭据中的userId
		if (!userKey) {
			const credentials = await this.getCredentials('feishuProjectApi');
			body.user_key = credentials.userId as string;
		} else {
			body.user_key = userKey;
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/projects/detail`,
			body: body,
		});
	}
};

export default SpaceDetailOperate;
