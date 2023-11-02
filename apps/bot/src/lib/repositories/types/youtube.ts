import type { HolodexChannel, YoutubeSubscription } from '@prisma/client';
import type { GuildId } from './generic';
import type { HolodexChannelId } from './holodex';

export type GuildAndHolodexChannelId = GuildId & HolodexChannelId;

export type YoutubeSubscriptionWithChannel = YoutubeSubscription & { channel: HolodexChannel };

export type UpsertYoutubeSettingsData = {
	enabled?: boolean;
	reactionRoleMessageId?: string | null;
	reactionRoleChannelId?: string | null;
};

export type UpdateYoutubeSubscriptionData = {
	message?: string | null;
	roleId?: string | null;
	discordChannelId?: string | null;
	memberRoleId?: string | null;
	memberDiscordChannelId?: string | null;
};
