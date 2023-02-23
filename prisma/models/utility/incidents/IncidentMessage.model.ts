import DiscordIncidentModel from './DiscordIncident.model';
import { createModel } from 'schemix';

export default createModel('IncidentMessage', (model) => {
	model
		.string('id', { unique: true }) // Message ID
		.string('channelId')
		.string('guildId')

		.string('incidentId', { unique: true })
		.relation('incident', DiscordIncidentModel, { fields: ['incidentId'], references: ['id'], onDelete: 'Cascade' });
});
