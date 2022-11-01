import { createModel } from 'schemix';
import EventModel from './utility/Event.model';
import SettingsModel from './Settings.mode';
import WelcomeModuleModel from './welcome/WelcomeModule.mode';
import ModerationModuleModel from './moderation/ModerationModule.mode';
import NotificationModuleModel from './notifications/NotificationModule.model';
import UtilityModuleModel from './utility/UtilityModule.model';


export default createModel((GuildModel) => {
    GuildModel
        .string('id', { id: true, unique: true })
        .dateTime('createdAt', { default: { now: true } })

        .relation('events', EventModel, { list: true })
        .relation('settings', SettingsModel, { optional: true })
        .relation('welcome', WelcomeModuleModel, { optional: true })
        .relation('moderation', ModerationModuleModel, { optional: true })
        .relation('utility', UtilityModuleModel, { optional: true })
        .relation('notifications', NotificationModuleModel, { optional: true });
});
