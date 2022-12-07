import { createModel } from 'schemix';
import EventModel from './Event.model';

export default createModel('EventUser', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true })
		.string('name')
		.string('partnerId', { unique: true, optional: true })
		.string('partnerName', { optional: true })
		.dateTime('createdAt', { default: { now: true }})

		.string('eventId', { unique: true })
		.relation('event', EventModel, { fields: ['eventId'], references: ['id'], onDelete: "Cascade" })
});
