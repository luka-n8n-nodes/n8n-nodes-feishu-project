import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const GroupBotJoinChatOperate: ResourceOperations = {
	name: '拉机器人入群',
	value: 'group:bot_join_chat',
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
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
		},
		{
			displayName: '应用App ID列表',
			name: 'app_ids',
			type: 'string',
			default: '',
			required: true,
			description: '飞书开放平台应用App ID列表，获取方法请参考飞书文档',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const appIds = this.getNodeParameter('app_ids', index) as string[] | string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		// 处理 app_ids：转换为数组，过滤空值
		const appIdsArray = Array.isArray(appIds)
			? appIds.filter((id: string) => id && id.trim())
			: (appIds && appIds.trim() ? [appIds] : []);

		if (appIdsArray.length === 0) {
			throw new Error('app_ids 参数不能为空，请至少提供一个应用App ID');
		}

		const body: IDataObject = {
			work_item_type_key: work_item_type_key,
			app_ids: appIdsArray,
		};

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/work_item/${work_item_id}/bot_join_chat`,
			body: body,
			timeout: options.timeout,
		});
	}
};

export default GroupBotJoinChatOperate;
