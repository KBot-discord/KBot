import MuteModel from './Mute.model';
import LockedChannelModel from './LockedChannel.model';
import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('ModerationSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true }) // Guild ID
		.boolean('enabled', { default: false })
		.string('logChannelId', { optional: true })
		.string('reportChannelId', { optional: true })
		.string('muteRoleId', { optional: true })

		.boolean('minAccountAgeEnabled', { default: false })
		.int('minAccountAgeReq', { optional: true })
		.string('minAccountAgeMsg', { optional: true })

		.boolean('antiHoistEnabled', { default: false })

		.relation('mutes', MuteModel, { list: true })
		.relation('lockedChannels', LockedChannelModel, { list: true })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
