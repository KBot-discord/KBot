module.exports = {
	root: true,
	extends: ['@kbotdev/eslint-config', 'turbo'],
	parserOptions: {
		project: './tsconfig.eslint.json',
		tsconfigRootDir: __dirname
	}
};
