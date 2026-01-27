import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { timeoutOnlyOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const ViewListOperate: ResourceOperations = {
	name: '获取视图列表及配置信息',
	value: 'view:list',
	order: 1,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"work_item_type_key": "",
				"view_ids": [""],
				"created_by": "",
				"created_at": {
					"start": 0,
					"end": 0
				},
				"page_size": 10,
				"page_num": 1,
				"view_name": ""
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/36ugg5au',
		},
		timeoutOnlyOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/view_conf/list`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default ViewListOperate;
