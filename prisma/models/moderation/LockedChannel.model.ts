import { createModel } from 'schemix';
import ModerationModuleMode from './ModerationModule.mode';

export default createModel('LockedChannel', (LockedChannelModel) => {
	// prettier-ignore
	LockedChannelModel
		.string('id', { unique: true })
		.bigInt('time')

		.string('guildId', { unique: true })
		.relation('moderation', ModerationModuleMode, { fields: ['guildId'], references: ['id'] })

		.id({ fields: ['id', 'guildId'] });
});
