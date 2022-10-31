import { WelcomeModule } from "./welcome";
import { ModerationModule } from "./moderation";
import { UtilityModule } from "./utility";
import { NotificationModule } from "./notification";

export * from './welcome';
export * from './moderation';
export * from './utility';
export * from './notification';

export interface GuildData {
    id: string;
    createdAt: Date;
    settings: Settings;
    welcome: WelcomeModule;
    moderation: ModerationModule;
    utility: UtilityModule;
    notifications: NotificationModule;
}

export interface Settings {
    id: string;
    staffRoles: string[];
    botManagers: string[];
    guild: Guild;
    guildId: string;
}
