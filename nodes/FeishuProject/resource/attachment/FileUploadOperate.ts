import { IDataObject, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import NodeUtils from '../../../help/utils/NodeUtils';
import { ResourceOperations } from '../../../help/type/IResource';
import { commonOptions, ICommonOptionsValue } from '../../../help/utils/sharedOptions';
import { DESCRIPTIONS } from '../../../help/description';

/**
 * 文件上传最大大小限制 (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const FileUploadOperate: ResourceOperations = {
	name: '文件上传',
	value: 'file:upload',
	order: 10,
	options: [
		DESCRIPTIONS.PROJECT_KEY,
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description:
				'包含要上传文件的二进制数据字段名，附件-目前最大支持100MB , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/g33r3mo4',
		},
		commonOptions,
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index, '', {
			extractValue: true,
		}) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const options = this.getNodeParameter('options', index, {}) as ICommonOptionsValue;

		// 使用 NodeUtils.buildUploadFileData 构建上传数据
		const file = await NodeUtils.buildUploadFileData.call(this, binaryPropertyName, index);

		if (!file || !file.value) {
			throw new NodeOperationError(
				this.getNode(),
				'未找到文件数据，请检查二进制文件字段名是否正确',
			);
		}

		// 检查文件大小
		const fileSize = file.value.length;
		if (fileSize > MAX_FILE_SIZE) {
			throw new NodeOperationError(
				this.getNode(),
				`文件大小 (${Math.round(fileSize / 1024 / 1024)}MB) 超过限制，附件最大支持100MB`,
			);
		}

		// 构造 FormData
		const formData: IDataObject = {
			file: {
				value: file.value,
				options: {
					filename: file.options.filename || 'file',
					contentType: file.options.contentType || 'application/octet-stream',
				},
			},
		};

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/file/upload`,
			body: formData,
			timeout: options.timeout,
		});
	},
};

export default FileUploadOperate;
