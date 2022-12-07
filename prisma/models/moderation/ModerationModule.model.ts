import { createModel } from 'schemix';
import MuteModel from './Mute.model';
import LockedChannelModel from './LockedChannel.model';
import GuildModel from '../Guild.model';

export default createModel('ModerationModule', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled', { default: true })
		.string('logChannel', { unique: true, optional: true })
		.string('reportChannel', { unique: true, optional: true })
		.int('minAccountAgeReq', { optional: true })
		.string('minAccountAgeMsg', { optional: true })

		.relation('mutes', MuteModel, { list: true })
		.relation('lockedChannels', LockedChannelModel, { list: true })

		.string('guildId', { unique: true })
		.relation('guild', GuildModel, { fields: ['guildId'], references: ['id'], onDelete: 'Cascade' })
});
