module.exports = {
	root: true,
	extends: ['../../.eslintrc.cjs'],
	parserOptions: {
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname
	},
	overrides: [
		{
			files: ['**/interaction-handlers/**/*.ts'],
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/explicit-module-boundary-types': 'off'
			}
		},
		{
			files: ['Augments.ts'],
			rules: {
				'no-multi-assign': 'off',
				'@typescript-eslint/no-invalid-void-type': 'off',
				'@typescript-eslint/consistent-type-definitions': 'off'
			}
		},
		{
			files: ['tests/**/*'],
			rules: { 'import/no-unresolved': 'off' }
		}
	]
};
