import { createModel } from 'schemix';
import EventModel from './Event.model';


export default createModel('EventUser', (EventUserModel) => {
    EventUserModel
        .string('id', { unique: true })
        .string('name')
        .string('partnerId', { unique: true, optional: true })
        .string('partnerName', { optional: true })

        .string('eventId', { unique: true })
        .relation('event', EventModel, { fields: ['eventId'], references: ['id'] })

        .id({ fields: ['id', 'eventId'] });
});
