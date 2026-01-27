import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const MeasureChartDetailOperate: ResourceOperations = {
	name: '获取度量图表明细数据',
	value: 'measure:chart_detail',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '图表ID',
			name: 'chart_id',
			type: 'string',
			required: true,
			default: '',
			description: '图表的唯一标识ID',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const chart_id = this.getNodeParameter('chart_id', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'GET',
			url: `/open_api/${project_key}/measure/${chart_id}`,
			timeout: options.timeout,
		});
	}
};

export default MeasureChartDetailOperate;
