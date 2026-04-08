import { IDataObject, IExecuteFunctions } from 'n8n-workflow';

/**
 * 尝试将 JSON 格式的字符串解析为对象/数组，非 JSON 字符串原样返回
 */
function tryParseJson(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	if (!trimmed) return value;
	if (
		(trimmed.startsWith('[') && trimmed.endsWith(']')) ||
		(trimmed.startsWith('{') && trimmed.endsWith('}'))
	) {
		try {
			return JSON.parse(trimmed);
		} catch {
			return value;
		}
	}
	return value;
}

/**
 * 从 resourceMapper 参数中提取字段键值对，转换为 API 所需的 { field_key, field_value }[] 格式。
 * 支持 defineBelow（手动赋值）和 autoMapInputData（自动映射输入数据）两种模式。
 * 字符串值如果是 JSON 格式会自动解析为对象/数组。
 */
export function extractResourceMapperFields(
	context: IExecuteFunctions,
	parameterName: string,
	itemIndex: number,
): IDataObject[] {
	const fieldMapping = context.getNodeParameter(parameterName, itemIndex, {}) as IDataObject;
	const mappingMode = fieldMapping.mappingMode as string;

	let fieldValues: Record<string, unknown>;

	if (mappingMode === 'autoMapInputData') {
		const inputData = context.getInputData();
		fieldValues = (inputData[itemIndex]?.json as Record<string, unknown>) || {};
	} else {
		fieldValues = (fieldMapping.value as Record<string, unknown>) || {};
	}

	return Object.entries(fieldValues)
		.filter(([, value]) => value !== null && value !== undefined && value !== '')
		.map(([field_key, rawValue]) => {
			const field_value = tryParseJson(rawValue);
			return {
				field_key,
				field_value: field_value as IDataObject | string | number | boolean,
			} as IDataObject;
		});
}
