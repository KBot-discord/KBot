module.exports = {
	root: true,
	extends: ['@kbotdev/eslint-config'],
	parserOptions: {
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname
	},
	overrides: [
		{
			files: ['Augments.ts'],
			rules: {
				'no-multi-assign': 'off',
				'@typescript-eslint/no-invalid-void-type': 'off',
				'@typescript-eslint/consistent-type-definitions': 'off'
			}
		}
	]
};
