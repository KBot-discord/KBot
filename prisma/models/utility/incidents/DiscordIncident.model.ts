import IncidentMessage from './IncidentMessage.model';
import { createModel } from 'schemix';

export default createModel('DiscordIncident', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true })
		.dateTime("createdAt", { default: { now: true } })
		.dateTime("updatedAt", { updatedAt: true })
		.boolean('resolved')

		.relation('messages', IncidentMessage, { list: true })
});
