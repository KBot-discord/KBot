module.exports = {
	root: true,
	extends: ['@kbotdev/eslint-config'],
	parserOptions: {
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname
	},
	overrides: [
		{ files: ['.model.ts'], rules: { 'eslint-disable-next-line': 0 } },
		{ files: ['Augments.ts'], rules: { 'no-multi-assign': 0 } },
		{ files: ['Augments.d.ts'], rules: { '@typescript-eslint/no-invalid-void-type': 0 } }
	]
};
