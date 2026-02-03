import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';

const SpaceDetailOperate: ResourceOperations = {
	name: '获取空间详情',
	value: 'space:detail',
	order: 20,
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
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject[]> {
		const projectKeys = this.getNodeParameter('project_keys', index) as string[] | string;
		const simpleNames = this.getNodeParameter('simple_names', index) as string[] | string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

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

		// 从凭证获取 user_key
		const credentials = await this.getCredentials('feishuProjectApi');
		body.user_key = credentials.userId as string;

		const response = await RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/projects/detail`,
			body: body,
			timeout: options.timeout,
		});

		// 将对象格式转换为纯数组格式
		return Object.values(response) as IDataObject[];
	}
};

export default SpaceDetailOperate;
