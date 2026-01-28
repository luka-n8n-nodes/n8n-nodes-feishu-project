import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const WorkItemConfigRelationDeleteOperate: ResourceOperations = {
	name: '删除工作项关系',
	value: 'work_item_config:relation_delete',
	order: 5,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '关系ID',
			name: 'relation_id',
			type: 'string',
			default: '',
			required: true,
			description: '工作项关系的唯一标识ID',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const relation_id = this.getNodeParameter('relation_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		const body: IDataObject = {
			relation_id,
			project_key,
		};

		return RequestUtils.request.call(this, {
			method: 'DELETE',
			url: `/open_api/work_item/relation/delete`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default WorkItemConfigRelationDeleteOperate;
