import { createModel } from 'schemix';
import DiscordIncidentModel from './DiscordIncident.model';

export default createModel('IncidentMessage', (model) => {
	// prettier-ignore
	model
		.string('id', { unique: true }) // Message ID
		.string('channelId')

		.string('incidentId', { unique: true })
		.relation('incident', DiscordIncidentModel, { fields: ['incidentId'], references: ['id'], onDelete: "Cascade" })
});
