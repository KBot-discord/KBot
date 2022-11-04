import { createModel } from 'schemix';
import GuildModel from './Guild.model';


export default createModel('Settings', (SettingsModel) => {
    SettingsModel
        .string('id', { unique: true })
        .string('staffRoles', { list: true })
        .string('botManagers', { list: true })

        .string('guildId', { unique: true })
        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
