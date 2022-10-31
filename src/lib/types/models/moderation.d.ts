import { GuildData } from "./index";

export interface ModerationModule {
    id: string;
    moduleEnabled: boolean;
    logChannel: string;
    reportChannel: string;
    minAccountAgeReq: number;
    minAccountAgeMsg: string;
    mutes: Mute[];
    lockedChannels: LockedChannel[];
    guild: GuildData;
    guildId: string;
}

export interface Mute {
    id: string;
    userId: string;
    time: Date;
    evadeTime: Date;
    moderation: ModerationModule;
    moderationId: string;
}

export interface LockedChannel {
    id: string;
    time: Date;
    moderation: ModerationModule;
    moderationId: string;
}
