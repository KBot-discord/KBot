module.exports = {
	root: true,
	extends: ['@sapphire', 'plugin:import/recommended', 'plugin:import/typescript'],
	plugins: ['import'],
	parserOptions: {
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname
	},
	ignorePatterns: ['*.cjs'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.d.ts']
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: 'src/tsconfig.json'
			}
		}
	},
	rules: {
		'@typescript-eslint/require-await': 0,
		'@typescript-eslint/no-base-to-string': 0,
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/switch-exhaustiveness-check': 0,
		'import/no-duplicates': 0,
		'import/no-unresolved': 'error',
		'import/no-named-as-default': 0,
		'import/order': [
			'error',
			{
				groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object', 'type']
			}
		]
	},
	overrides: [
		{ files: ['.model.ts'], rules: { 'eslint-disable-next-line': 0 } },
		{ files: ['Augments.ts'], rules: { 'no-multi-assign': 0 } },
		{ files: ['Augments.d.ts'], rules: { '@typescript-eslint/no-invalid-void-type': 0 } }
	]
};
