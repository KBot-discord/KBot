import TwitchSubscriptionModel from './TwitchSubscription.model';
import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('TwitchSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.boolean('enabled', { default: false })

		.relation('twitch', TwitchSubscriptionModel, { list: true })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
