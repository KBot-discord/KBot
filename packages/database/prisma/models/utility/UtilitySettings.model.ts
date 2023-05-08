import PollModel from './polls/Poll.model';
import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('UtilitySettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.boolean('enabled', { default: false })
		.string('incidentChannelId', { unique: true, optional: true })
		.string('creditsChannelId', { optional: true })

		.relation('polls', PollModel, { list: true })

		.relation('coreSettings', CoreSettingsModel, {
			fields: ['guildId'],
			references: ['guildId'],
			onDelete: 'Cascade'
		});
});
