import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const SpaceRelationBindOperate: ResourceOperations = {
	name: '绑定空间关联的关联工作项实例',
	value: 'space_relation:bind',
	order: 3,
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
		{
			displayName: '工作项ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: '请求体参数',
			name: 'body',
			type: 'json',
			default: JSON.stringify({
				"relation_rule_id": "",
				"instances": [
					// {
					// 	"project_key": "",
					// 	"work_item_type_key": "",
					// 	"work_item_id": 0,
					// 	"chat_group_merge": 0
					// }
				]
			}, null, 2),
			description: '完整的请求体参数，JSON格式 , 详见：https://project.feishu.cn/b/helpcenter/1p8d7djs/568y2esm',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const bodyParam = this.getNodeParameter('body', index) as string;
		const body: IDataObject = NodeUtils.parseJsonParameter(bodyParam, '请求体参数');
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/relation/${work_item_type_key}/${work_item_id}/batch_bind`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default SpaceRelationBindOperate;
