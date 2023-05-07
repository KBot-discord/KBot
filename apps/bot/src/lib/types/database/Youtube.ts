import type { YoutubeSubscription, YoutubeSettings, HolodexChannel } from '@kbotdev/database';
import type { GuildId } from '#types/database/index';
import type { HolodexChannelId } from '#types/database/Holodex';

export type GuildAndHolodexChannelId = GuildId & HolodexChannelId;

export type YoutubeSubscriptionWithChannel = YoutubeSubscription & { channel: HolodexChannel };

export interface UpsertYoutubeSettingsData {
	enabled?: YoutubeSettings['enabled'];
	reactionRoleMessageId?: YoutubeSettings['reactionRoleMessageId'];
	reactionRoleChannelId?: YoutubeSettings['reactionRoleChannelId'];
}

export interface UpdateYoutubeSubscriptionData {
	message?: YoutubeSubscription['message'];
	roleId?: YoutubeSubscription['roleId'];
	discordChannelId?: YoutubeSubscription['discordChannelId'];
	memberRoleId?: YoutubeSubscription['memberRoleId'];
	memberDiscordChannelId?: YoutubeSubscription['memberDiscordChannelId'];
}
