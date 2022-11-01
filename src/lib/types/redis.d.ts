// Types
import type {
    GuildData,
    ModerationModule,
    NotificationModule,
    Settings,
    UtilityModule,
    WelcomeModule
} from "./models";


export const enum RedisNamespaces {
    Guild = 'guilds',
    Settings = 'settings',
    WelcomeModule = 'welcome',
    ModerationModule = 'moderation',
    UtilityModule = 'utility',
    NotificationModule = 'notification',
}

export type RedisData<T extends RedisNamespaces> =
    T extends 'guilds'
    ? GuildData
    : T extends 'settings'
    ? Settings
    : T extends 'welcome'
    ? WelcomeModule
    : T extends 'moderation'
    ? ModerationModule
    : T extends 'utility'
    ? UtilityModule
    : T extends 'notification'
    ? NotificationModule
    : never;