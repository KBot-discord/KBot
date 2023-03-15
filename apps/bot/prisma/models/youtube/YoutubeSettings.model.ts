import YoutubeSubscriptionModel from './YoutubeSubscription.model';
import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('YoutubeSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.boolean('enabled', { default: false })

		.relation('youtube', YoutubeSubscriptionModel, { list: true })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
