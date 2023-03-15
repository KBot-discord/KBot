import { createEnum } from 'schemix';

export default createEnum('ModerationActionType', (model) => {
	model //
		.addValue('UNDEFINED')
		.addValue('BAN')
		.addValue('KICK')
		.addValue('MUTE')
		.addValue('TIMEOUT')
		.addValue('UNBAN')
		.addValue('UNMUTE')
		.addValue('UNTIMEOUT');
});
