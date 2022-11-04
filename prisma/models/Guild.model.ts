import { createModel } from 'schemix';
import SettingsModel from './Settings.mode';
import WelcomeModuleModel from './welcome/WelcomeModule.mode';
import ModerationModuleModel from './moderation/ModerationModule.mode';
import UtilityModuleModel from './utility/UtilityModule.model';
import NotificationModuleModel from './notifications/NotificationModule.model';


export default createModel('Guild', (GuildModel) => {
    GuildModel
        .string('id', { id: true, unique: true })
        .dateTime('createdAt', { default: { now: true } })

        .relation('settings', SettingsModel, { optional: true })
        .relation('welcome', WelcomeModuleModel, { optional: true })
        .relation('moderation', ModerationModuleModel, { optional: true })
        .relation('utility', UtilityModuleModel, { optional: true })
        .relation('notifications', NotificationModuleModel, { optional: true });
});
