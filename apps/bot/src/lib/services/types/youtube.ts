import type { HolodexChannel, YoutubeSubscription } from '@prisma/client';

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
