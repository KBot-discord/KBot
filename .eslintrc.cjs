// eslint-disable-next-line tsdoc/syntax
/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	extends: ['@kbotdev/eslint-config', 'turbo'],
	parserOptions: {
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname
	},
	rules: {
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/return-await': ['error', 'always']
	}
};
