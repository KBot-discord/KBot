import KaraokeUser from './KaraokeUser.model';
import EventSettingsModel from '../EventSettings.model';
import { createModel } from 'schemix';

export default createModel('KaraokeEvent', (model) => {
	model
		.string('id', { id: true, unique: true })
		.string('textChannelId')
		.boolean('locked')
		.boolean('isActive')
		.string('pinMessageId', { optional: true })
		.string('discordEventId', { optional: true })
		.string('roleId', { optional: true })

		.relation('queue', KaraokeUser, { list: true })

		.string('guildId', { unique: true })
		.relation('eventSettings', EventSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
