import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const SpaceRelationRulesListOperate: ResourceOperations = {
	name: '获取空间关联规则列表',
	value: 'space_relation:rules_list',
	options: [
		{
			displayName: '空间ID',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '空间 ID (project_key) 或空间域名 (simple_name)。project_key 在飞书项目空间双击空间名称获取；simple_name 一般在飞书项目空间 URL 中获取，例如空间 URL为"https://project.feishu.cn/doc/overview"，则 simple_name 为"doc"',
		},
		{
			displayName: '关联空间列表',
			name: 'remote_projects',
			type: 'string',
			default: '',
			description: '关联空间的 project_key 列表，用于指定需要关联的空间',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const remoteProjects = this.getNodeParameter('remote_projects', index) as string[] | string;

		const body: IDataObject = {};

		// 处理 remote_projects：转换为数组，过滤空值
		const remoteProjectsArray = Array.isArray(remoteProjects)
			? remoteProjects.filter((key: string) => key && key.trim())
			: (remoteProjects && remoteProjects.trim() ? [remoteProjects] : []);

		// 如果提供了 remote_projects，添加到 body
		if (remoteProjectsArray.length > 0) {
			body.remote_projects = remoteProjectsArray;
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/relation/rules`,
			body: body,
		});
	}
};

export default SpaceRelationRulesListOperate;
