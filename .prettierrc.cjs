module.exports = {
	...require('@killbasa/prettier-config'),
	overrides: [
		{
			files: '*.{yml,yaml}',
			options: {
				singleQuote: false,
				useTabs: false,
			},
		},
	],
};
