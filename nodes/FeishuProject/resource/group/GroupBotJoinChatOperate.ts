import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const GroupBotJoinChatOperate: ResourceOperations = {
	name: '拉机器人入群',
	value: 'group:bot_join_chat',
	options: [
		{
			displayName: '空间ID',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '空间 ID (project_key) 或空间域名 (simple_name)。project_key 在飞书项目空间双击空间名称获取；simple_name 一般在飞书项目空间 URL 中获取，例如空间 URL为"https://project.feishu.cn/doc/overview"，则 simple_name 为"doc"',
		},
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角"..." > ID获取',
		},
		{
			displayName: '工作项类型Key',
			name: 'work_item_type_key',
			type: 'string',
			required: true,
			default: '',
			description: '工作项类型，可通过获取空间下工作项类型接口获取',
		},
		{
			displayName: '应用App ID列表',
			name: 'app_ids',
			type: 'string',
			default: '',
			required: true,
			description: '飞书开放平台应用App ID列表，获取方法请参考飞书文档',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index) as string;
		const appIds = this.getNodeParameter('app_ids', index) as string[] | string;

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
		});
	}
};

export default GroupBotJoinChatOperate;
