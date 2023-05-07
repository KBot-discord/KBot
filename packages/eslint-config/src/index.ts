module.exports = {
	root: true,
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
	plugins: ['import'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		warnOnUnsupportedTypeScriptVersion: false
	},
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
		'prettier/prettier': [
			'error',
			{
				printWidth: 150
			}
		],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/require-await': 'off',
		'@typescript-eslint/no-base-to-string': 'off',
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				fixStyle: 'separate-type-imports'
			}
		],
		'@typescript-eslint/switch-exhaustiveness-check': 'off',
		'import/no-duplicates': 'off',
		'import/no-unresolved': 'error',
		'import/no-named-as-default': 'off',
		'import/order': [
			'error',
			{
				groups: [
					'index', //
					'sibling',
					'parent',
					'internal',
					'external',
					'builtin',
					'object',
					'type'
				]
			}
		]
	}
};
