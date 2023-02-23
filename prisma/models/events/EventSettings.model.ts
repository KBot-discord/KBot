import EventModel from '../events/Event.model';
import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('EventSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true }) // Guild ID
		.boolean('enabled', { default: false })

		.relation('events', EventModel, { list: true })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
