import { createModel } from 'schemix';
import EventModel from './events/Event.model';
import PollModel from './polls/Poll.model';
import GuildModel from '../Guild.model';

export default createModel('UtilityModule', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled', { default: true })
		.string('incidentChannel', { unique: true, optional: true })
		.string('creditsChannel', { unique: true, optional: true })

		.relation('events', EventModel, { list: true })
		.relation('polls', PollModel, { list: true })

		.relation('guild', GuildModel, { fields: ['id'], references: ['id'], onDelete: 'Cascade' })
});
