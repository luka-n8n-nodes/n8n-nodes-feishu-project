import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const SpaceWorkItemTypesOperate: ResourceOperations = {
	name: '获取空间下工作项类型',
	value: 'space:work_item_types',
	order: 30,
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
			url: `/open_api/${project_key}/work_item/all-types`,
			timeout: options.timeout,
		});
	}
};

export default SpaceWorkItemTypesOperate;
