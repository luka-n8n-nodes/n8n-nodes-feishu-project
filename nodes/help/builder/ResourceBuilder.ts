import { INodePropertyOptions, INodeProperties } from 'n8n-workflow';
import { IResource, ResourceOperations, OperationCallFunction } from '../type/IResource';

class ResourceBuilder {
	resources: IResource[] = [];

	addResource(resource: INodePropertyOptions) {
		this.resources.push({
			...resource,
			operations: [],
		});
	}

	addOperate(resourceName: string, operate: ResourceOperations) {
		const resource = this.resources.find((resource) => resource.value === resourceName);
		if (resource) {
			resource.operations.push(operate);
		}
	}

	build(): INodeProperties[] {
		// 构建 Operations
		const list: INodeProperties[] = [];

		list.push({
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: this.resources.map((item) => {
				return {
					...item,
					description: item.description || '',
					action: item.action || '',
					operations: null,
				};
			}),
			default: '',
		});

		for (const resource of this.resources) {
			if (resource.operations.length === 0) continue;
			list.push({
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [resource.value],
					},
				},
				options: resource.operations.map((item) => {
					return {
						...item,
						description: item.description || '',
						action: item.action || item.name || '',
						options: null,
					};
				}),
				default: '',
			});

			for (const operation of resource.operations) {
				for (const option of operation.options) {
					// @ts-ignore
					list.push({
						...option,
						displayOptions: {
							...(option.displayOptions || {}),
							show: {
								...(option.displayOptions?.show || {}),
								resource: [resource.value],
								operation: [operation.value],
							},
						},
					});
				}
			}
		}

		return list;
	}

	getCall(resourceName: string, operateName: string): OperationCallFunction | undefined {
		const resource = this.resources.find((item) => item.value === resourceName);
		if (!resource) {
			return undefined;
		}
		const operate = resource.operations.find((item) => item.value === operateName);
		return operate?.call;
	}
}

export default ResourceBuilder;
