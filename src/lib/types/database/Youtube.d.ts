import type { YoutubeChannel, YoutubeVideo, YoutubeSubscription, YoutubeSettings } from '#prisma';
import type { Expand } from '#types/Generic';
import type { GuildId } from '#types/database/index';

export interface YoutubeChannelId {
	channelId: YoutubeChannel['id'];
}

export interface YoutubeVideoById {
	videoId: YoutubeVideo['id'];
}

export type GuildAndYoutubeChannelId = Expand<GuildId, YoutubeChannelId>;

export type YoutubeSubscriptionWithChannel = YoutubeSubscription & { channel: YoutubeChannel };

export interface UpsertYoutubeSettingsData {
	enabled?: YoutubeSettings['enabled'];
}

export interface UpdateYoutubeSubscriptionData {
	message?: YoutubeSubscription['message'];
	role?: YoutubeSubscription['role'];
	webhookId?: YoutubeSubscription['webhookId'];
	webhookToken?: YoutubeSubscription['webhookToken'];
	discordChannel?: YoutubeSubscription['discordChannel'];
	discordChannelError?: YoutubeSubscription['discordChannelError'];
}
