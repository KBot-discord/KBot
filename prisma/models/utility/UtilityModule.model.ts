import { createModel } from 'schemix';
import EventModel from './Event.model';
import PollModel from './Poll.model';
import GuildModel from '../Guild.model';


export default createModel('UtilityModule', (UtilityModuleModel) => {
    UtilityModuleModel
        .string('id', { unique: true })
        .boolean('moduleEnabled')

        .relation('events', EventModel, { list: true })
        .relation('polls', PollModel, { list: true })
        .string('guildId', { unique: true })
        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
