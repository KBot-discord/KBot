import { createEnum } from 'schemix';

export default createEnum('FeatureFlags', (model) => {
	model //
		.addValue('UNDEFINED')
		.addValue('DEV')
		.addValue('BETA');
});
