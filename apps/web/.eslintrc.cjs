module.exports = {
	root: true,
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	plugins: ['svelte3', '@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		extraFileExtensions: ['.svelte'],
		ecmaVersion: 2020,
		sourceType: 'module',
		warnOnUnsupportedTypeScriptVersion: false
	},
	ignorePatterns: ['*.cjs', '*.js'],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte3/svelte3'
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	env: {
		es6: true,
		browser: true
	},
	rules: {
		'@typescript-eslint/no-empty-interface': 0,
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/no-explicit-any': 0
	}
};
