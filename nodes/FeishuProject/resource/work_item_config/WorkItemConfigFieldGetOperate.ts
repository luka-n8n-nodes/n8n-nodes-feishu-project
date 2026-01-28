import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigFieldGetOperate: ResourceOperations = {
	name: '获取字段信息',
	value: 'work_item_config:field_get',
	order: 1,
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

		const body: IDataObject = {
			work_item_type_key,
		};

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/field/all`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigFieldGetOperate;
