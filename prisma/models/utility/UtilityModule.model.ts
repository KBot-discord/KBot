import { createModel } from 'schemix';
import PollModel from './Poll.model';
import GuildModel from '../Guild.model';


export default createModel((UtilityModuleModel) => {
    UtilityModuleModel
        .string('id', { unique: true })
        .boolean('moduleEnabled')

        .relation('polls', PollModel, { list: true })
        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })
        .string('guildId', { unique: true })

        .id({ fields: ['id', 'guildId'] });
});
