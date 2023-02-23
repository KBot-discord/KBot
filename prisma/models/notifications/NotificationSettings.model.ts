import TwitchSubscriptionModel from './twitch/TwitchSubscription.model';
import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('NotificationSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.boolean('enabled', { default: false })

		.relation('twitch', TwitchSubscriptionModel, { list: true })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
