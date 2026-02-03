import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigBaseInfoGetOperate: ResourceOperations = {
	name: '获取工作项基础信息配置',
	value: 'work_item_config:base_info_get',
	description: '该接口用于获取指定工作项类型的基础信息配置，对应的平台功能介绍详见<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/2rv0xerq">基本信息配置</a>和<a href="https://project.feishu.cn/b/helpcenter/1ykiuvvj/3t60v7vo">基本信息页配置</a>',
	order: 10,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Work Item Type Name or ID',
			name: 'work_item_type_key',
			type: 'options',
			default: '',
			required: true,
			description: '选择工作项类型。需要先选择空间。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemTypes',
			},
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/work_item/type/${work_item_type_key}`,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigBaseInfoGetOperate;
