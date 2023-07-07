module.exports = {
	root: true,
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'plugin:prettier/recommended'
	],
	plugins: ['@typescript-eslint'],
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
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	env: {
		es6: true,
		browser: true
	},
	rules: {
		'@typescript-eslint/ban-ts-comment': 0,
		'@typescript-eslint/no-empty-interface': 0,
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/no-explicit-any': 0
	}
};
