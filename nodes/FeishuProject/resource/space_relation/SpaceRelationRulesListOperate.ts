import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const SpaceRelationRulesListOperate: ResourceOperations = {
	name: '获取空间关联规则列表',
	value: 'space_relation:rules_list',
	order: 10,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '关联空间列表',
			name: 'remote_projects',
			type: 'string',
			default: '',
			description: '关联空间的 project_key 列表，用于指定需要关联的空间',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const remoteProjects = this.getNodeParameter('remote_projects', index) as string[] | string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

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
			timeout: options.timeout,
		});
	}
};

export default SpaceRelationRulesListOperate;
