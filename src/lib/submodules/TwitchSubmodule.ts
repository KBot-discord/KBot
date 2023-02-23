import { TwitchRepository } from '#repositories/notifications/TwitchRepository';
import { BrandColors, EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import { channelMention, roleMention } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { CreateTwitchAccData, TwitchSubWithAcc, UpdateTwitchSubData } from '#types/repositories/TwitchRepository';
import type { GuildTextBasedChannel, Guild } from 'discord.js';
import type {
	EventSubOnlineData,
	TwitchApiStreamData,
	TwitchApiStreamsResponse,
	TwitchApiSubscriptionResponse,
	TwitchApiUserData,
	TwitchApiUsersResponse,
	TwitchStreamData
} from '#types/Twitch';

export class TwitchSubmodule {
	private readonly baseTwitchHelixUrl = 'https://api.twitch.tv/helix/';
	private readonly defaultMessage = '{name} is playing {game} at {link}!';
	private readonly repository: TwitchRepository;

	public constructor() {
		this.repository = new TwitchRepository();
	}

	public async getAccountSubscriptions(accountId: string) {
		return this.repository.findManySubscriptionsByAccount({ accountId });
	}

	public async countAccounts() {
		return this.repository.countAccounts();
	}

	public async accountExists(accountId: string) {
		return this.repository.accountExists({ accountId });
	}

	public async getGuildSubscriptions(guildId: string) {
		return this.repository.findManySubscriptionsByGuild({ guildId });
	}

	public async deleteSubscription(guildId: string, accountId: string) {
		const subscription = await this.repository.deleteSubscription({ guildId, accountId });

		if (subscription) {
			// TODO handler error properly
			await this.removeApiSubscription(subscription.account.twitchSubscriptionId);
		}

		return subscription;
	}

	public async createSubscription(guildId: string, accountId: string, data: Omit<CreateTwitchAccData, 'twitchSubscriptionId'>) {
		// TODO handler error properly
		const subscriptionId = await this.addApiSubscription(accountId);
		if (!subscriptionId) return;
		return this.repository.createSubscription({ guildId, accountId }, { ...data, twitchSubscriptionId: subscriptionId });
	}

	public async updateSubscription(guildId: string, accountId: string, data: UpdateTwitchSubData) {
		return this.repository.updateSubscription({ guildId, accountId }, data);
	}

	public buildSubscriptionEmbed(guild: Guild, { account, message, discordChannelId, roleId }: TwitchSubWithAcc): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'Twitch notification settings', iconURL: getGuildIcon(guild) })
			.setTitle(account.name)
			.setFields([
				{ name: 'Message', value: message ?? this.defaultMessage },
				{ name: 'Channel', value: discordChannelId ? channelMention(discordChannelId) : 'No channel set' },
				{ name: 'Role', value: roleId ? roleMention(roleId) : 'No role set' }
			])
			.setThumbnail(account.image);
	}

	public async postStream(eventsubData: EventSubOnlineData) {
		const accountWithSubscriptions = await this.getAccountSubscriptions(eventsubData.broadcaster_user_id);
		if (isNullish(accountWithSubscriptions)) {
			container.logger.error(`Received an EventSub for ${eventsubData.broadcaster_user_name} but that account was not in the database.`);
			return;
		}

		const apiData = await this.fetchApiStream(eventsubData.broadcaster_user_id);
		if (isNullish(apiData)) return;

		const streamData = this.combineStreamData(eventsubData, apiData);

		const embed = this.buildStreamEmbed(streamData);

		await Promise.allSettled(
			accountWithSubscriptions.subscriptions.map(async (subscription) => {
				const { message, discordChannelId, roleId, guildId } = subscription;

				const guild = await container.client.guilds.fetch(guildId);
				const channel = (await guild.channels.fetch(discordChannelId!)) as GuildTextBasedChannel | null;
				if (isNullish(channel)) return;

				const { result } = await container.validator.channels.canSendEmbeds(channel);
				if (!result) {
					return;
				}

				const formattedMessage = this.formatMessage(message, roleId, streamData);

				return channel.send({
					content: formattedMessage,
					embeds: [embed]
				});
			})
		);
	}

	public async fetchApiAccounts(accountNames: string[]): Promise<TwitchApiUserData[]> {
		const { bearer } = container.config.twitch;

		const url = new URL(`${this.baseTwitchHelixUrl}users`);
		for (const name of accountNames) {
			url.searchParams.append('login', name);
		}

		try {
			// https://dev.twitch.tv/docs/api/reference/#get-users
			const response = await fetch<TwitchApiUsersResponse>(url.href, {
				method: FetchMethods.Get,
				headers: { Authorization: `Bearer ${bearer}` }
			});

			return response.data;
		} catch (err: unknown) {
			container.logger.error(err);
			return [];
		}
	}

	private async fetchApiStream(userId: string): Promise<TwitchApiStreamData | undefined> {
		const { bearer } = container.config.twitch;

		const url = new URL(`${this.baseTwitchHelixUrl}streams`);
		url.searchParams.append('user_id', userId);

		try {
			// https://dev.twitch.tv/docs/api/reference/#get-streams
			const response = await fetch<TwitchApiStreamsResponse>(
				url.href,
				{
					method: FetchMethods.Get,
					headers: { Authorization: `Bearer ${bearer}` }
				},
				FetchResultTypes.JSON
			);

			const stream = response.data[0];
			if (isNullish(stream)) return undefined;

			return stream;
		} catch (err: unknown) {
			container.logger.error(err);
			return undefined;
		}
	}

	private async addApiSubscription(userId: string): Promise<string | undefined> {
		const { secret, bearer, callback } = container.config.twitch;

		try {
			// https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#subscribing-to-events
			const response = await fetch<{ data: TwitchApiSubscriptionResponse[] }>(
				`${this.baseTwitchHelixUrl}eventsub/subscriptions`,
				{
					method: FetchMethods.Post,
					body: JSON.stringify({
						type: 'stream.online',
						version: '1',
						condition: {
							broadcaster_user_id: userId
						},
						transport: {
							method: 'webhook',
							callback,
							secret
						}
					}),
					headers: { Authorization: `Bearer ${bearer}` }
				},
				FetchResultTypes.JSON
			);

			const stream = response.data[0];
			if (isNullish(stream)) return undefined;

			return stream.id;
		} catch (err: unknown) {
			container.logger.error(err);
			return undefined;
		}
	}

	private async removeApiSubscription(subscriptionId: string): Promise<string | undefined> {
		const { bearer } = container.config.twitch;

		const url = new URL(`${this.baseTwitchHelixUrl}eventsub/subscriptions`);
		url.searchParams.append('id', subscriptionId);

		try {
			// https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#deleting-a-subscription
			const response = await fetch<{ data: TwitchApiSubscriptionResponse[] }>(
				url.href,
				{
					method: FetchMethods.Delete,
					headers: { Authorization: `Bearer ${bearer}` }
				},
				FetchResultTypes.JSON
			);

			const result = response.data[0];
			if (isNullish(result)) return undefined;

			return result.id;
		} catch (err: unknown) {
			container.logger.error(err);
			return undefined;
		}
	}

	// TODO https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
	/*
	private async fetchApiBearerToken() {}

	private async refreshApiBearerToken() {}
	 */

	private formatMessage(message: string | null, roleId: string | null, streamData: TwitchStreamData): string {
		const parsedMessage = (message ?? this.defaultMessage)
			.replaceAll(/{name}/g, streamData.userName)
			.replaceAll(/{title}/g, streamData.title)
			.replaceAll(/{game}/g, streamData.gameName)
			.replaceAll(/{link}/g, `<https://twitch.tv/${streamData.userName}>`);

		return `${roleId ? `${roleMention(roleId)} ` : ''}${parsedMessage}`;
	}

	private combineStreamData(eventsubData: EventSubOnlineData, apiData: TwitchApiStreamData): TwitchStreamData {
		return {
			type: eventsubData.type,
			userId: eventsubData.broadcaster_user_id,
			userName: eventsubData.broadcaster_user_name,
			gameId: apiData.game_id,
			gameName: apiData.game_name,
			title: apiData.title,
			viewerCount: apiData.viewer_count,
			thumbnail: apiData.thumbnail_url
		};
	}

	private buildStreamEmbed(streamData: TwitchStreamData): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(BrandColors.Twitch)
			.setAuthor({ name: streamData.userName, url: `https://twitch.tv/${streamData.userName}` })
			.setTitle(streamData.title)
			.setThumbnail(streamData.thumbnail)
			.setFooter({ text: 'Powered by KBot' })
			.setTimestamp();
	}
}
