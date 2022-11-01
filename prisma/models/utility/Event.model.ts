import { createModel } from 'schemix';
import GuildModel from '../Guild.model';
import ScheduledEventModel from './ScheduledEvent.model';


export default createModel((EventModel) => {
    EventModel
        .string('id', { unique: true })
        .string('stage')
        .string('pinMsg')
        .string('channel')
        .string('queue', { list: true })
        .boolean('isQueueLocked')

        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })
        .string('guildId', { unique: true })
        .relation('scheduledEvent', ScheduledEventModel, { list: true })

        .id({ fields: ['id', 'guildId'] });
});
