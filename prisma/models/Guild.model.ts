import ModerationModule from './moderation/ModerationModule.model';
import NotificationModule from './notifications/NotificationModule.model';
import UtilityModule from './utility/UtilityModule.model';
import WelcomeModule from './welcome/WelcomeModule.model';
import { createModel } from 'schemix';

export default createModel('Guild', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Guild ID
		.string('staffRoles', { list: true })
		.string('botManagers', { list: true })
		.dateTime('createdAt', { default: { now: true } })

		.relation('moderationModule', ModerationModule, { optional: true })
		.relation('notificationModule', NotificationModule, { optional: true })
		.relation('utilityModule', UtilityModule, { optional: true })
		.relation('welcomeModule', WelcomeModule, { optional: true })
});
