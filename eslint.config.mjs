import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		rules: {
			// 禁用 n8n 社区节点限制规则
			'@n8n/community-nodes/no-restricted-imports': 'off',
			'@n8n/community-nodes/no-restricted-globals': 'off',
			'@n8n/community-nodes/credential-test-required': 'off',
			'@n8n/community-nodes/credential-password-field': 'off',
			'@n8n/community-nodes/no-deprecated-workflow-functions': 'off',
			'@n8n/community-nodes/cred-class-oauth2-naming': 'off',
			'@n8n/community-nodes/require-node-api-error': 'off',
			'@n8n/community-nodes/webhook-lifecycle-complete': 'off',
			'@n8n/community-nodes/icon-prefer-themed-variants': 'off',
			'@n8n/community-nodes/missing-paired-item': 'off',
			'@n8n/community-nodes/no-runtime-dependencies': 'off',
			'@n8n/community-nodes/no-http-request-with-manual-auth': 'off',
			'@n8n/community-nodes/no-hardcoded-secrets': 'off',
			'@n8n/community-nodes/node-connection-type-literal': 'off',
			'@n8n/community-nodes/require-node-description-fields': 'off',

			// 禁用 n8n-nodes-base 规则
			'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
			'n8n-nodes-base/node-param-default-missing': 'off',
			'n8n-nodes-base/node-param-collection-type-unsorted-items': 'off',
			'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
			'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'off',
			'n8n-nodes-base/node-param-default-wrong-for-options': 'off',
			'n8n-nodes-base/node-param-description-wrong-for-dynamic-options': 'off',

			// 禁用 TypeScript 严格规则
			'@typescript-eslint/no-duplicate-enum-values': 'off',
			'no-useless-catch': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',

			// 禁用其他规则
			'prefer-const': 'off',
			'no-console': 'off',
			'import-x/no-duplicates': 'off',
		},
	},
];
