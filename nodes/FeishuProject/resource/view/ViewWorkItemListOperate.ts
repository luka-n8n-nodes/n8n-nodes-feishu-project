import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const ViewWorkItemListOperate: ResourceOperations = {
	name: '获取视图下工作项列表',
	value: 'view:work_item_list',
	order: 2,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '视图ID',
			name: 'view_id',
			type: 'string',
			required: true,
			default: '',
			description: '视图的唯一标识ID',
		},
		{
			displayName: '页码',
			name: 'page_num',
			type: 'number',
			default: 1,
			description: '页码，从0开始',
		},
		{
			displayName: '页大小',
			name: 'page_size',
			type: 'number',
			default: 10,
			description: '每页条数',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const view_id = this.getNodeParameter('view_id', index) as string;
		const page_num = this.getNodeParameter('page_num', index, 1) as number;
		const page_size = this.getNodeParameter('page_size', index, 10) as number;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/fix_view/${view_id}?page_num=${page_num}&page_size=${page_size}`,
			timeout: options.timeout,
		});
	}
};

export default ViewWorkItemListOperate;
