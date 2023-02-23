import EventSettingsModel from '../events/EventSettings.model';
import ModerationSettingsModel from '../moderation/ModerationSettings.model';
import NotificationSettingsModel from '../notifications/NotificationSettings.model';
import UtilitySettingsModel from '../utility/UtilitySettings.model';
import WelcomeSettingsModel from '../welcome/WelcomeSettings.model';
import { createModel } from 'schemix';

export default createModel('CoreSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true }) // Guild ID
		.string('staffRoles', { list: true })
		.string('botManagers', { list: true })

		.relation('eventSettings', EventSettingsModel, { optional: true })
		.relation('moderationSettings', ModerationSettingsModel, { optional: true })
		.relation('notificationsSettings', NotificationSettingsModel, { optional: true })
		.relation('utilitySettings', UtilitySettingsModel, { optional: true })
		.relation('welcomeSettings', WelcomeSettingsModel, { optional: true });
});
