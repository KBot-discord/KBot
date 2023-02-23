import { AutocompleteChannelService, ChannelService, GuildService, SubscriptionService } from '#rpc/youtube';
import { toOptional, toRequired } from '#lib/rpc/utils';
import { EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { container } from '@sapphire/framework';
import { createGrpcTransport, createPromiseClient } from '@bufbuild/connect-node';
import { EmbedBuilder } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import type { PromiseClient, Transport } from '@bufbuild/connect-node';
import type { AutocompleteChannel, Channel, Subscription, Guild } from '#rpc/youtube';
import type { Guild as DiscordGuild } from 'discord.js';

export class YoutubeSubmodule {
	private readonly transport: Transport;

	private readonly autoCompleteChannels: PromiseClient<typeof AutocompleteChannelService>;
	private readonly channels: PromiseClient<typeof ChannelService>;
	private readonly guilds: PromiseClient<typeof GuildService>;
	private readonly subscriptions: PromiseClient<typeof SubscriptionService>;

	public constructor() {
		const { host, port } = container.config.rpc.youtube;

		this.transport = createGrpcTransport({
			baseUrl: `http://${host}:${port}`,
			httpVersion: '2',
			interceptors: []
		});

		this.autoCompleteChannels = createPromiseClient(AutocompleteChannelService, this.transport);
		this.channels = createPromiseClient(ChannelService, this.transport);
		this.guilds = createPromiseClient(GuildService, this.transport);
		this.subscriptions = createPromiseClient(SubscriptionService, this.transport);
	}

	public async getAutocompleteChannel(input: string): Promise<AutocompleteChannel[] | undefined> {
		const response = await this.autoCompleteChannels.getAutocompleteChannel({ channelName: input });
		return response.channels;
	}

	public async getChannel(channelId: string): Promise<Channel | undefined> {
		const response = await this.channels.getChannel({ channelId });
		return response.channel;
	}

	public async getGuildSubscriptions(guildId: string): Promise<Subscription[]> {
		const response = await this.subscriptions.getGuildSubscriptions({ guildId });
		return response.subscriptions;
	}

	public async createSubscription(guildId: string, channelId: string): Promise<Subscription | undefined> {
		const response = await this.subscriptions.createSubscription({ guildId, channelId });
		return response.subscription;
	}

	public async updateSubscription(
		guildId: string,
		channelId: string,
		message?: string | null,
		role?: string | null,
		discordChannel?: string | null
	): Promise<Subscription | undefined> {
		const messageValue = toOptional(message);
		const roleValue = toOptional(role);
		const discordChannelValue = toOptional(discordChannel);

		const response = await this.subscriptions.updateSubscription({
			guildId,
			channelId,
			message: messageValue,
			role: roleValue,
			discordChannel: discordChannelValue
		});

		return response.subscription;
	}

	public async deleteSubscription(guildId: string, channelId: string): Promise<Subscription | undefined> {
		const response = await this.subscriptions.deleteSubscription({ guildId, channelId });
		return response.subscription;
	}

	public async toggleGuild(guildId: string, value: boolean): Promise<Guild | undefined> {
		const enabledValue = toRequired(value);
		const response = await this.guilds.updateGuild({ guildId, enabled: enabledValue });
		return response.guild;
	}

	public async deleteGuild(guildId: string): Promise<Guild | undefined> {
		const response = await this.guilds.deleteGuild({ guildId });
		return response.guild;
	}

	public buildSubscriptionEmbed(guild: DiscordGuild, { channelName, channelImage, message, discordChannel, role }: Subscription): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'YouTube notification settings', iconURL: getGuildIcon(guild) })
			.setTitle(channelName)
			.setFields([
				{ name: 'Message', value: message ?? 'No message set.' },
				{ name: 'Channel', value: discordChannel ? channelMention(discordChannel) : 'No channel set.' },
				{ name: 'Role', value: role ? roleMention(role) : 'No role set.' }
			])
			.setThumbnail(channelImage);
	}
}
