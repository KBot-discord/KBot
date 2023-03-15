import { VideoStatus } from '#prisma';
import {
	YoutubeVideoService,
	YoutubeChannelService,
	YoutubeSettingsService,
	YoutubeSubscriptionService,
	YoutubeMessageService,
	YoutubeApiService
} from '#services/youtube';
import { getGuildIcon } from '#utils/Discord';
import { EmbedColors } from '#utils/constants';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { XMLParser } from 'fast-xml-parser';
import { container } from '@sapphire/framework';
import type { YoutubeVideo, YoutubeSettings } from '#prisma';
import type { Guild } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { YoutubeSubscriptionWithChannel, UpsertYoutubeSettingsData } from '#types/database';
import type { ParsedXmlChannel } from '#types/Youtube';

@ApplyOptions<Module.Options>({
	fullName: 'Youtube Module'
})
export class YoutubeModule extends Module {
	public readonly api: YoutubeApiService;
	public readonly settings: YoutubeSettingsService;
	public readonly channels: YoutubeChannelService;
	public readonly messages: YoutubeMessageService;
	public readonly subscriptions: YoutubeSubscriptionService;
	public readonly videos: YoutubeVideoService;

	private readonly parser: XMLParser;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new YoutubeSettingsService();
		this.channels = new YoutubeChannelService();
		this.messages = new YoutubeMessageService();
		this.subscriptions = new YoutubeSubscriptionService();
		this.videos = new YoutubeVideoService();

		this.parser = new XMLParser({
			removeNSPrefix: true
		});
		this.api = new YoutubeApiService();

		this.container.youtube = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.settings.get({ guildId: guild.id });
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<YoutubeSettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertYoutubeSettingsData): Promise<YoutubeSettings> {
		return this.settings.upsert({ guildId }, data);
	}

	public buildSubscriptionEmbed(guild: Guild, { channel, message, channelId, roleId }: YoutubeSubscriptionWithChannel): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'YouTube notification settings', iconURL: getGuildIcon(guild) })
			.setTitle(channel.name)
			.setFields([
				{ name: 'Message', value: message ?? 'No message set.' },
				{ name: 'Channel', value: channelId ? channelMention(channelId) : 'No channel set.' },
				{ name: 'Role', value: roleId ? roleMention(roleId) : 'No role set.' }
			])
			.setThumbnail(channel.image);
	}

	public async fetchApiChannel(channelId: string) {
		const xmlResult = await fetch(
			`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
			{ method: FetchMethods.Get },
			FetchResultTypes.Result
		);
		if (!xmlResult.ok) return null;

		const apiResult = await this.api.fetchChannels(channelId);
		if (!apiResult) return null;

		const savedChannels = await this.channels.upsertMany(apiResult);

		const channel = savedChannels.find(({ id }) => id === channelId);
		return channel ?? null;
	}

	public async handleNewChannel(channelId: string): Promise<YoutubeVideo[] | null> {
		const page = await fetch(
			`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
			{ method: FetchMethods.Get },
			FetchResultTypes.Buffer
		);
		container.logger.debug(page);
		if (isNullish(page)) return null;

		const json = this.convertXmlToJson(page);
		const videos = this.formatVideosFromJson(json);
		return this.videos.upsertMany(videos);
	}

	public convertXmlToJson(xml: string | Buffer): ParsedXmlChannel {
		return this.parser.parse(xml);
	}

	public formatVideosFromJson(page: ParsedXmlChannel): Omit<YoutubeVideo, 'updatedAt'>[] {
		return page.feed.entry.map(({ videoId, title, channelId, group }) => ({
			id: videoId,
			title,
			thumbnail: group.thumbnail,
			status: VideoStatus.NEW,
			scheduledStartTime: null,
			actualStartTime: null,
			actualEndTime: null,
			channelId
		}));
	}

	public async pubsubSubscribe(channelId: string) {
		return this.pubsubRequest(channelId, 'subscribe');
	}

	public async pubsubUnsubscribe(channelId: string) {
		await this.pubsubRequest(channelId, 'unsubscribe');
	}

	private async pubsubRequest(channelId: string, mode: 'subscribe' | 'unsubscribe') {
		const { api, youtube } = this.container.config;
		const response = await fetch(
			'https://pubsubhubbub.appspot.com',
			{
				method: FetchMethods.Post,
				headers: { 'content-type': MimeTypes.ApplicationFormUrlEncoded },
				body: {
					hub: {
						mode,
						topic: `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`,
						callback: `https://${api.host}:${api.port}/youtube/pubsub`,
						secret: youtube.pubsub.secret
					}
				}
			},
			FetchResultTypes.Result
		);

		return response.status === 200 //
			? response.json()
			: null;
	}

	private static readonly youtubeChannelIdPattern = /[a-zA-Z0-9-_]{24}/;
	private static readonly youtubeChannelNamePattern = /[a-zA-Z0-9)]{6,20}/;

	public static isYoutubeChannelIdValid(input: string): boolean {
		return YoutubeModule.youtubeChannelIdPattern.test(input);
	}

	public static isYoutubeChannelNameValid(input: string): boolean {
		return YoutubeModule.youtubeChannelNamePattern.test(input);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		YoutubeModule: never;
	}
}
