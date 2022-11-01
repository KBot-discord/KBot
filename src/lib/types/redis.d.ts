// Types
import type {
    GuildData,
    Settings,
    WelcomeModule,
    ModerationModule,
    LockedChannel,
    UtilityModule,
    Poll,
    NotificationModule,
} from './models';


export const enum RedisNamespaces {
    Guild = 'guilds',
    Settings = 'settings',
    WelcomeModule = 'welcome',
    ModerationModule = 'moderation',
    LockedChannels = 'lockedchannels',
    UtilityModule = 'utility',
    Polls = 'polls',
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
    : T extends 'lockedchannels'
    ? LockedChannel
    : T extends 'utility'
    ? UtilityModule
    : T extends 'polls'
    ? Poll
    : T extends 'notification'
    ? NotificationModule
    : never;
