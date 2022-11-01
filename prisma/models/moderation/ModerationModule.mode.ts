import { createModel } from 'schemix';
import GuildModel from '../Guild.model';
import MuteModel from './Mute.model';
import LockedChannelModel from './LockedChannel.model';


export default createModel((ModerationModuleModel) => {
    ModerationModuleModel
        .string('id', { unique: true })
        .boolean('moduleEnabled')
        .string('logChannel')
        .string('reportChannel')
        .int('minAccountAgeReq')
        .string('minAccountAgeMsg')

        .relation('mutes', MuteModel, { list: true })
        .relation('lockedChannels', LockedChannelModel, { list: true })
        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })
        .string('guildId', { unique: true })

        .id({ fields: ['id', 'guildId'] });
});
