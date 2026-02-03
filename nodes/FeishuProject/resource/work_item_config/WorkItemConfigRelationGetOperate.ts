import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigRelationGetOperate: ResourceOperations = {
	name: '获取工作项关系列表',
	value: 'work_item_config:relation_get',
	description: '该接口用于获取指定空间下的工作项关联关系列表，对应的平台功能介绍详见<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/se3xal6e">关系管理</a>',
	order: 60,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/work_item/relation`,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigRelationGetOperate;
