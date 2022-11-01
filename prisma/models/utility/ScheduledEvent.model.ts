import { createModel } from 'schemix';
import EventModel from './Event.model';


export default createModel((ScheduledEventModel) => {
    ScheduledEventModel
        .string('id')
        .string('scheduleId')
        .string('role')
        .string('channel')

        .relation('event', EventModel, { fields: ['eventId'], references: ['id'] })
        .string('eventId', { unique: true })

        .id({ fields: ['id', 'eventId'] });
});
