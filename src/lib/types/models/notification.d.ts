import { GuildData } from "./index";

export interface NotificationModule {
    id: string;
    moduleEnabled: boolean;
    twitter: Twitter;
    youtube: Youtube;
    twitch: Twitch;
    guild: GuildData;
    guildId: string;
}

export interface Twitter {
    id: string;
    follows: TwitterFollow[];
    notifications: NotificationModule;
    notificationId: string;
}

export interface TwitterFollow {
    id: string;
    message: string;
    webhookId: string;
    webhookToken: string;
    account: TwitterAccount;
    accountId: string;
    twitter: Twitter;
    twitterId: string;
}

export interface TwitterAccount {
    id: string;
    name: string;
    image: string;
    follows: TwitterFollow[];
}

export interface Youtube {
    id: string;
    subscriptions: Subscription[];
    notifications: NotificationModule;
    notificationId: string;
}

export interface Subscription {
    id: string;
    message: string;
    webhookId: string;
    webhookToken: string;
    channel: YoutubeChannel;
    channelId: string;
    youtube: Youtube;
    youtubeId: string;
}

export interface YoutubeChannel {
    id: string;
    name: string;
    image: string;
    subscriptions: Subscription[];
}

export interface Twitch {
    id: string;
    follows: TwitchFollow[];
    notifications: NotificationModule;
    notificationId: string;
}

export interface TwitchFollow {
    id: string;
    message: string;
    webhookId: string;
    webhookToken: string;
    channel: TwitchChannel;
    channelId: string;
    twitch: Twitch;
    twitchId: string;
}

export interface TwitchChannel {
    id: string;
    name: string;
    image: string;
    follows: TwitchFollow[];
}
