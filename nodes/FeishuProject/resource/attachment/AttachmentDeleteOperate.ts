import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { DESCRIPTIONS } from '../../../help/description';

const AttachmentDeleteOperate: ResourceOperations = {
	name: '删除附件',
	value: 'attachment:delete',
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
			displayName: '附件字段 Name or ID',
			name: 'field_key',
			type: 'options',
			default: '',
			required: true,
			description: '选择要删除附件的目标字段。需要先选择空间和工作项类型。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadAttachmentFields',
			},
		},
		{
			displayName: '附件UUID列表',
			name: 'uuids',
			type: 'string',
			default: '',
			required: true,
			description: '需要删除的附件唯一标识列表，多个UUID用英文逗号分隔，也支持表达式传递数组。可通过工作项详情接口下的附件字段(multi_file类型)获取',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const work_item_id = this.getNodeParameter('work_item_id', index) as string;
		const field_key = this.getNodeParameter('field_key', index) as string;
		const uuids = this.getNodeParameter('uuids', index) as string[] | string;

		// 处理 uuids：支持逗号分隔的字符串或数组，过滤空值
		let uuidsArray: string[];
		if (Array.isArray(uuids)) {
			// 表达式传递数组的情况
			uuidsArray = uuids.map((uuid: string) => String(uuid).trim()).filter((uuid) => uuid);
		} else {
			// 字符串按逗号分割
			uuidsArray = String(uuids || '')
				.split(',')
				.map((uuid) => uuid.trim())
				.filter((uuid) => uuid);
		}

		if (uuidsArray.length === 0) {
			throw new Error('uuids 参数不能为空，请至少提供一个附件UUID');
		}

		const body: IDataObject = {
			work_item_id: Number(work_item_id),
			project_key: project_key,
			uuids: uuidsArray,
		};

		if (field_key?.trim()) {
			body.field_key = field_key.trim();
		}

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/file/delete`,
			body: body,
		});
	}
};

export default AttachmentDeleteOperate;
