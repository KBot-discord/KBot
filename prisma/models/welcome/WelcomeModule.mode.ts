import { createModel } from 'schemix';
import GuildModel from '../Guild.model';


export default createModel('WelcomeModule', (WelcomeModuleModel) => {
    WelcomeModuleModel
        .string('id', { unique: true })
        .boolean('moduleEnabled')
        .boolean('messagesEnabled')
        .string('channel')
        .string('message')
        .string('title')
        .string('description')
        .string('image')
        .string('color')

        .string('guildId', { unique: true })
        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
