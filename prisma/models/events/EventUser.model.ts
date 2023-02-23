import EventModel from './Event.model';
import { createModel } from 'schemix';

export default createModel('EventUser', (model) => {
	model
		.string('id', { id: true, unique: true })
		.string('name')
		.string('partnerId', { unique: true, optional: true })
		.string('partnerName', { optional: true })
		.dateTime('createdAt', { default: { now: true } })

		.string('eventId', { unique: true })
		.relation('event', EventModel, { fields: ['eventId'], references: ['guildId'], onDelete: 'Cascade' })

		.unique({ fields: ['id', 'eventId'] });
});
