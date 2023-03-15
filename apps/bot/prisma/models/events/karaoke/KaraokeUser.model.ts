import KaraokeEventModel from './KaraokeEvent.model';
import { createModel } from 'schemix';

export default createModel('KaraokeUser', (model) => {
	model
		.string('id', { id: true })
		.string('name')
		.string('partnerId', { optional: true })
		.string('partnerName', { optional: true })
		.dateTime('createdAt', { default: { now: true } })

		.string('eventId')
		.relation('karaokeEvent', KaraokeEventModel, { fields: ['eventId'], references: ['id'], onDelete: 'Cascade' })

		.unique({ fields: ['id', 'eventId'] });
});
