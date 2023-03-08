import { BrandColors, EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { TwitchSettingsService, TwitchAccountService, TwitchSubscriptionService } from '#services/twitch';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { Module } from '@kbotdev/plugin-modules';
import { channelMention, roleMention } from '@discordjs/builders';
import { isNullish } from '@sapphire/utilities';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { TwitchSettings } from '#prisma';
import type { Guild, GuildTextBasedChannel } from 'discord.js';
import type { TwitchSubWithAcc, UpsertTwitchSettingsData } from '#types/database';
import type {
	EventSubOnlineData,
	TwitchApiStreamData,
	TwitchApiStreamsResponse,
	TwitchApiSubscriptionResponse,
	TwitchApiUserData,
	TwitchApiUsersResponse,
	TwitchStreamData
} from '#types/Twitch';

@ApplyOptions<Module.Options>({
	fullName: 'Notification Module'
})
export class TwitchModule extends Module {
	public readonly settings: TwitchSettingsService;
	public readonly accounts: TwitchAccountService;
	public readonly subscriptions: TwitchSubscriptionService;

	private readonly baseTwitchHelixUrl = 'https://api.twitch.tv/helix/';
	private readonly defaultMessage = '{name} is playing {game} at {link}!';

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new TwitchSettingsService();
		this.accounts = new TwitchAccountService();
		this.subscriptions = new TwitchSubscriptionService();

		this.container.twitch = this;
	}

	public async getSettings(guildId: string): Promise<TwitchSettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertTwitchSettingsData): Promise<TwitchSettings> {
		return this.settings.upsert({ guildId }, data);
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
		const { metrics, client, validator, logger } = this.container;

		const accountWithSubscriptions = await this.subscriptions.getByAccount({
			accountId: eventsubData.broadcaster_user_id
		});
		if (isNullish(accountWithSubscriptions)) {
			logger.error(`Received an EventSub for ${eventsubData.broadcaster_user_name} but that account was not in the database.`);
			metrics.incrementTwitch({ success: false });
			return;
		}

		const apiData = await this.fetchApiStream(eventsubData.broadcaster_user_id);
		if (isNullish(apiData)) {
			metrics.incrementTwitch({ success: false });
			return;
		}

		const streamData = this.combineStreamData(eventsubData, apiData);

		const embed = this.buildStreamEmbed(streamData);

		await Promise.allSettled(
			accountWithSubscriptions.subscriptions.map(async (subscription) => {
				const { message, discordChannelId, roleId, guildId } = subscription;

				const guild = await client.guilds.fetch(guildId);
				const channel = (await guild.channels.fetch(discordChannelId!)) as GuildTextBasedChannel | null;
				const { result } = await validator.channels.canSendEmbeds(channel);
				if (isNullish(channel) || !result) {
					return;
				}

				metrics.incrementYoutube({ success: true });
				const formattedMessage = this.formatMessage(message, roleId, streamData);

				return channel.send({
					content: formattedMessage,
					embeds: [embed]
				});
			})
		);
	}

	public async fetchApiAccounts(accountNames: string[]): Promise<TwitchApiUserData[]> {
		const { config, logger } = this.container;

		const url = new URL(`${this.baseTwitchHelixUrl}users`);
		for (const name of accountNames) {
			url.searchParams.append('login', name);
		}

		try {
			// https://dev.twitch.tv/docs/api/reference/#get-users
			const response = await fetch<TwitchApiUsersResponse>(url.href, {
				method: FetchMethods.Get,
				headers: { Authorization: `Bearer ${config.twitch.bearer}` }
			});

			return response.data;
		} catch (err: unknown) {
			logger.error(err);
			return [];
		}
	}

	public async addApiSubscription(userId: string): Promise<string | undefined> {
		const { config, logger } = this.container;

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
							callback: config.twitch.callback,
							secret: config.twitch.secret
						}
					}),
					headers: { Authorization: `Bearer ${config.twitch.bearer}` }
				},
				FetchResultTypes.JSON
			);

			const stream = response.data[0];
			if (isNullish(stream)) return undefined;

			return stream.id;
		} catch (err: unknown) {
			logger.error(err);
			return undefined;
		}
	}

	public async removeApiSubscription(subscriptionId: string): Promise<string | undefined> {
		const { config, logger } = this.container;

		const url = new URL(`${this.baseTwitchHelixUrl}eventsub/subscriptions`);
		url.searchParams.append('id', subscriptionId);

		try {
			// https://dev.twitch.tv/docs/eventsub/manage-subscriptions/#deleting-a-subscription
			const response = await fetch<{ data: TwitchApiSubscriptionResponse[] }>(
				url.href,
				{
					method: FetchMethods.Delete,
					headers: { Authorization: `Bearer ${config.twitch.bearer}` }
				},
				FetchResultTypes.JSON
			);

			const result = response.data[0];
			if (isNullish(result)) return undefined;

			return result.id;
		} catch (err: unknown) {
			logger.error(err);
			return undefined;
		}
	}

	private async fetchApiStream(userId: string): Promise<TwitchApiStreamData | undefined> {
		const { config, logger } = this.container;

		const url = new URL(`${this.baseTwitchHelixUrl}streams`);
		url.searchParams.append('user_id', userId);

		try {
			// https://dev.twitch.tv/docs/api/reference/#get-streams
			const response = await fetch<TwitchApiStreamsResponse>(
				url.href,
				{
					method: FetchMethods.Get,
					headers: { Authorization: `Bearer ${config.twitch.bearer}` }
				},
				FetchResultTypes.JSON
			);

			const stream = response.data[0];
			if (isNullish(stream)) return undefined;

			return stream;
		} catch (err: unknown) {
			logger.error(err);
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

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		TwitchModule: never;
	}
}
