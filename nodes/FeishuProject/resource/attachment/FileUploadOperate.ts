import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const FileUploadOperate: ResourceOperations = {
	name: '文件上传',
	value: 'file:upload',
	options: [
		{
			displayName: '项目Key',
			name: 'project_key',
			type: 'string',
			required: true,
			default: '',
			description: '项目的唯一标识Key',
		},
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: '包含要上传文件的二进制数据字段名，附件-目前最大支持100MB , 详见：https://project.feishu.cn/b/helpcenter/2.0.0/1p8d7djs/g33r3mo4',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const project_key = this.getNodeParameter('project_key', index) as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

		// 获取二进制数据信息
		const items = this.getInputData();
		const binaryData = items[index].binary;

		if (!binaryData || !binaryData[binaryPropertyName]) {
			throw new Error(`在索引 ${index} 的项目中未找到二进制数据 "${binaryPropertyName}"`);
		}

		const fileInfo = binaryData[binaryPropertyName];

		// 获取实际的二进制数据Buffer
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(
			index,
			binaryPropertyName,
		);

		// 构造正确的FormData格式
		const formData: IDataObject = {
			file: {
				value: binaryDataBuffer,
				options: {
					filename: fileInfo.fileName || 'file',
					contentType: fileInfo.mimeType || 'application/octet-stream',
				},
			},
		};

		return RequestUtils.request.call(this, {
			method: 'POST',
			url: `/open_api/${project_key}/file/upload`,
			formData: formData,
			json: true,
		});
	}
};

export default FileUploadOperate;
