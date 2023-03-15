import { createEnum } from 'schemix';

export default createEnum('VideoStatus', (model) => {
	model //
		.addValue('NONE')
		.addValue('NEW')
		.addValue('LIVE')
		.addValue('UPCOMING')
		.addValue('PAST')
		.addValue('MISSING');
});
