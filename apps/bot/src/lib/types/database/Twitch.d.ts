import type { UtilitySettings, TwitchAccount, TwitchSubscription } from '#prisma';
import type { Expand } from '#types/Generic';
import type { GuildId } from '#types/database/index';

export interface TwitchAccountId {
	accountId: TwitchAccount['id'];
}

export type GuildAndTwitchAccountId = Expand<TwitchAccountId & GuildId>;

export type TwitchAccWithSubs = Expand<TwitchAccount & { subscriptions: TwitchSubscription[] }>;

export type TwitchSubWithAcc = Expand<TwitchSubscription & { account: TwitchAccount }>;

export interface UpsertTwitchSettingsData {
	enabled?: UtilitySettings['enabled'];
}

export interface CreateTwitchAccData {
	id: TwitchAccount['id'];
	name: TwitchAccount['name'];
	image: TwitchAccount['image'];
	twitchSubscriptionId: TwitchAccount['twitchSubscriptionId'];
}

export interface UpdateTwitchAccData {
	name?: TwitchAccount['name'];
	image?: TwitchAccount['image'];
}

export interface UpdateTwitchSubData {
	message?: TwitchSubscription['message'];
	role?: TwitchSubscription['role'];
	webhookId?: TwitchSubscription['webhookId'];
	webhookToken?: TwitchSubscription['webhookToken'];
	discordChannel?: TwitchSubscription['discordChannel'];
	discordChannelError?: TwitchSubscription['discordChannelError'];
}
