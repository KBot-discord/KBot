module.exports = {
	...require('@kbotdev/prettier-config'),
	overrides: [
		{
			files: '*.{yml,yaml}',
			options: {
				singleQuote: false,
				useTabs: false
			}
		}
	]
};
