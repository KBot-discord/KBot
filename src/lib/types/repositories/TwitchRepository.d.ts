import type { Expand } from '#types/Generic';
import type { TwitchAccount, TwitchSubscription } from '#prisma';
import type { QueryByGuildId } from './';

export interface TwitchAccById {
	accountId: TwitchAccount['id'];
}

export type TwitchSubByIdAndGuildId = Expand<TwitchAccById & QueryByGuildId>;

export type TwitchAccWithSubs = Expand<TwitchAccount & { subscriptions: TwitchSubscription[] }>;

export type TwitchSubWithAcc = Expand<TwitchSubscription & { account: TwitchAccount }>;

export interface CreateTwitchAccData {
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
