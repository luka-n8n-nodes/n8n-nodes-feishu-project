import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { paginationOptions, timeoutOption } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

const CommentQueryOperate: ResourceOperations = {
	name: '查询评论',
	value: 'comment:query',
	order: 10,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: '评论对象类型',
			name: 'object_type',
			type: 'options',
			default: 'WORKITEM',
			required: true,
			description: '评论对象类型。WORKITEM 查询工作项评论；WORKITEMFIELD 查询工作项字段评论；CHILDCOMMENT 查询子评论',
			options: [
				{
					name: '工作项 (WORKITEM)',
					value: 'WORKITEM',
					description: '需要 work_item_type_key 和 work_item_id',
				},
				{
					name: '工作项字段 (WORKITEMFIELD)',
					value: 'WORKITEMFIELD',
					description: '需要 work_item_type_key、work_item_id 和 field_key',
				},
				{
					name: '子评论 (CHILDCOMMENT)',
					value: 'CHILDCOMMENT',
					description: '需要 parent_id',
				},
			],
		},
		{
			displayName: '工作项类型 Name or ID',
			name: 'work_item_type_key',
			type: 'options',
			default: '',
			required: true,
			description: '空间下工作项类型，需要先选择空间，详见：<a href="https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/3pjp854w">获取空间下工作项类型</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemTypes',
			},
			displayOptions: {
				show: {
					object_type: ['WORKITEM', 'WORKITEMFIELD'],
				},
			},
		},
		{
			displayName: '工作项实例ID',
			name: 'work_item_id',
			type: 'string',
			required: true,
			default: '',
			description: '工作项实例 ID，在工作项实例详情中，展开右上角 ··· > ID 获取。',
			displayOptions: {
				show: {
					object_type: ['WORKITEM', 'WORKITEMFIELD'],
				},
			},
		},
		{
			displayName: '字段 Key Name or ID',
			name: 'field_key',
			type: 'options',
			default: '',
			required: true,
			description: '字段 key，需与工作项类型中的字段保持一致。Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			typeOptions: {
				loadOptionsMethod: 'loadWorkItemFieldsAll',
			},
			displayOptions: {
				show: {
					object_type: ['WORKITEMFIELD'],
				},
			},
		},
		{
			displayName: '父评论ID',
			name: 'parent_id',
			type: 'string',
			required: true,
			default: '',
			description: '父评论 ID，可通过查询评论或创建评论接口获取。指同一实例下的一级评论 ID，不可使用二级评论 ID。',
			displayOptions: {
				show: {
					object_type: ['CHILDCOMMENT'],
				},
			},
		},
		paginationOptions.returnAll,
		paginationOptions.limit(),
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: '分页方向',
					name: 'direction',
					type: 'options',
					default: 'DESC',
					options: [
						{ name: '降序 (DESC)', value: 'DESC' },
						{ name: '升序 (ASC)', value: 'ASC' },
					],
					description: '分页查询方向',
				},
				{
					displayName: '返回富文本 Markdown',
					name: 'need_rich_text_mark_down',
					type: 'boolean',
					default: false,
					// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
					description: '是否返回富文本 Markdown 格式内容',
				},
				timeoutOption,
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const object_type = this.getNodeParameter('object_type', index, 'WORKITEM') as string;
		const work_item_type_key = this.getNodeParameter('work_item_type_key', index, '') as string;
		const work_item_id = this.getNodeParameter('work_item_id', index, '') as string;
		const field_key = this.getNodeParameter('field_key', index, '') as string;
		const parent_id = this.getNodeParameter('parent_id', index, '') as string;
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;
		const options = this.getNodeParameter('options', index, {}) as IDataObject;

		const object: IDataObject = { type: object_type };

		if (object_type === 'CHILDCOMMENT') {
			if (!parent_id) {
				throw new Error('查询子评论时必须填写 parent_id');
			}
			object.parent_id = parent_id;
		} else {
			if (!work_item_type_key || !work_item_id) {
				throw new Error('查询工作项评论时必须填写 work_item_type_key 和 work_item_id');
			}
			object.work_item_type_key = work_item_type_key;
			object.work_item_id = work_item_id;
			if (object_type === 'WORKITEMFIELD') {
				if (!field_key) {
					throw new Error('查询工作项字段评论时必须填写 field_key');
				}
				object.field_key = field_key;
			}
		}

		const direction = (options.direction as string) || 'DESC';

		const fetchPage = async (cursor: string, pageSize: number) => {
			const body: IDataObject = {
				project_key,
				object,
				paginator: {
					cursor,
					direction,
					page_size: pageSize,
				},
			};

			if (options.need_rich_text_mark_down !== undefined) {
				body.need_rich_text_mark_down = options.need_rich_text_mark_down;
			}

			const response = await RequestUtils.request.call(this, {
				method: 'POST',
				url: '/open_api/comment/query',
				body,
				timeout: options.timeout as number | undefined,
			}) as IDataObject;

			const comments = (response?.comments as IDataObject[]) || [];
			const nextCursor = (response?.next_cursor || response?.NextCursor || response?.nextCursor || '') as string;

			return { comments, nextCursor };
		};

		const maxPageSize = 50;

		if (returnAll) {
			let allResults: IDataObject[] = [];
			let cursor = '';

			while (true) {
				const { comments, nextCursor } = await fetchPage(cursor, maxPageSize);
				allResults = allResults.concat(comments);

				if (!nextCursor || comments.length === 0 || comments.length < maxPageSize) {
					break;
				}

				cursor = nextCursor;

				if (allResults.length >= 10000) {
					this.logger.warn('已达到最大结果数限制(10000条)，停止获取');
					break;
				}
			}

			return allResults;
		}

		let allResults: IDataObject[] = [];
		let cursor = '';

		while (allResults.length < limit) {
			const remaining = limit - allResults.length;
			const pageSize = Math.min(maxPageSize, remaining);
			const { comments, nextCursor } = await fetchPage(cursor, pageSize);
			allResults = allResults.concat(comments);

			if (!nextCursor || comments.length === 0 || comments.length < pageSize) {
				break;
			}

			cursor = nextCursor;
		}

		return allResults.slice(0, limit);
	},
};

export default CommentQueryOperate;
