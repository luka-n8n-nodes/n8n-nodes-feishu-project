import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const AttachmentDeleteOperate: ResourceOperations = {
	name: '删除附件',
	value: 'attachment:delete',
	options: [
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角"..." > ID获取',
		},
		{
			displayName: '空间ID',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '空间 ID (project_key) 或空间域名 (simple_name)。project_key 在飞书项目空间双击空间名称获取；simple_name 一般在飞书项目空间 URL 中获取，例如空间 URL为"https://project.feishu.cn/doc/overview"，则 simple_name 为"doc"',
		},
		{
			displayName: '附件UUID列表',
			name: 'uuids',
			type: 'string',
			typeOptions: {
				multipleValues: true,
			},
			default: [],
			required: true,
			description: '需要删除的附件唯一标识列表，可通过工作项详情接口下的附件字段(multi_file类型)获取',
		},
		{
			displayName: '字段Key',
			name: 'field_key',
			type: 'string',
			default: '',
			description: '附件字段ID，用于删除附件，支持复合字段的子字段，可通过工作项详情接口获取。与 field_alias 参数二选一传入即可',
		},
		{
			displayName: '字段别名',
			name: 'field_alias',
			type: 'string',
			default: '',
			description: '附件字段别名，用于删除附件，支持复合字段的子字段，可通过工作项详情接口获取。与 field_key 参数二选一传入即可',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const project_key = this.getNodeParameter('project_key', index) as string;
		const uuids = this.getNodeParameter('uuids', index) as string[] | string;
		const field_key = this.getNodeParameter('field_key', index) as string;
		const field_alias = this.getNodeParameter('field_alias', index) as string;

		// 处理 uuids：转换为数组，过滤空值
		const uuidsArray = Array.isArray(uuids)
			? uuids.filter((uuid: string) => uuid && uuid.trim())
			: (uuids && uuids.trim() ? [uuids] : []);

		if (uuidsArray.length === 0) {
			throw new Error('uuids 参数不能为空，请至少提供一个附件UUID');
		}

		const body: IDataObject = {
			work_item_id: Number(work_item_id),
			project_key: project_key,
			uuids: uuidsArray,
		};

		// field_key 和 field_alias 二选一，不能同时为空，也不能同时填写
		if (field_key && field_key.trim() && field_alias && field_alias.trim()) {
			throw new Error('field_key 和 field_alias 不能同时填写，请只选择其中一个');
		}

		if (field_key && field_key.trim()) {
			body.field_key = field_key.trim();
		} else if (field_alias && field_alias.trim()) {
			body.field_alias = field_alias.trim();
		} else {
			throw new Error('field_key 和 field_alias 不能同时为空，请至少填写其中一个');
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/file/delete`,
			body: body,
		});
	}
};

export default AttachmentDeleteOperate;
