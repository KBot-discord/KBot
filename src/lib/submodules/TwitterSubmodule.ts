import { AccountService, AutocompleteAccountService, GuildService, SubscriptionService } from '#rpc/twitter';
import { toOptional, toRequired } from '#lib/rpc/utils';
import { EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { container } from '@sapphire/framework';
import { createGrpcTransport, createPromiseClient } from '@bufbuild/connect-node';
import { EmbedBuilder } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import type { Guild as DiscordGuild } from 'discord.js';
import type { Account, AutocompleteAccount, Subscription, Guild } from '#rpc/twitter';
import type { PromiseClient, Transport } from '@bufbuild/connect-node';

export class TwitterSubmodule {
	private readonly transport: Transport;

	private readonly autoCompleteAccounts: PromiseClient<typeof AutocompleteAccountService>;
	private readonly accounts: PromiseClient<typeof AccountService>;
	private readonly guilds: PromiseClient<typeof GuildService>;
	private readonly subscriptions: PromiseClient<typeof SubscriptionService>;

	public constructor() {
		const { host, port } = container.config.rpc.youtube;

		this.transport = createGrpcTransport({
			baseUrl: `http://${host}:${port}`,
			httpVersion: '2'
		});

		this.autoCompleteAccounts = createPromiseClient(AutocompleteAccountService, this.transport);
		this.accounts = createPromiseClient(AccountService, this.transport);
		this.guilds = createPromiseClient(GuildService, this.transport);
		this.subscriptions = createPromiseClient(SubscriptionService, this.transport);
	}

	public async getAutocompleteAccount(input: string): Promise<AutocompleteAccount[] | undefined> {
		const response = await this.autoCompleteAccounts.getAutocompleteAccount({ accountName: input });
		return response.accounts;
	}

	public async getAccount(accountId: string): Promise<Account | undefined> {
		const response = await this.accounts.getAccount({ accountId });
		return response.account;
	}

	public async getSubscription(guildId: string, accountId: string): Promise<Subscription | undefined> {
		const response = await this.subscriptions.getSubscription({ guildId, accountId });
		return response.subscription;
	}

	public async getGuildSubscriptions(guildId: string): Promise<Subscription[]> {
		const response = await this.subscriptions.getGuildSubscriptions({ guildId });
		return response.subscriptions;
	}

	public async createSubscription(guildId: string, accountId: string): Promise<Subscription | undefined> {
		const response = await this.subscriptions.createSubscription({ guildId, accountId });
		return response.subscription;
	}

	public async updateSubscription(
		guildId: string,
		accountId: string,
		message?: string | null,
		role?: string | null,
		discordChannel?: string | null
	): Promise<Subscription | undefined> {
		const messageValue = toOptional(message);
		const roleValue = toOptional(role);
		const discordChannelValue = toOptional(discordChannel);

		const response = await this.subscriptions.updateSubscription({
			guildId,
			accountId,
			message: messageValue,
			role: roleValue,
			discordChannel: discordChannelValue
		});

		return response.subscription;
	}

	public async deleteSubscription(guildId: string, accountId: string): Promise<Subscription | undefined> {
		const response = await this.subscriptions.deleteSubscription({ guildId, accountId });
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

	public buildSubscriptionEmbed(guild: DiscordGuild, { accountName, accountImage, message, discordChannel, role }: Subscription): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'Twitter notification settings', iconURL: getGuildIcon(guild) })
			.setTitle(accountName)
			.setFields([
				{ name: 'Message', value: message ?? 'No message set.' },
				{ name: 'Channel', value: discordChannel ? channelMention(discordChannel) : 'No channel set.' },
				{ name: 'Role', value: role ? roleMention(role) : 'No role set.' }
			])
			.setThumbnail(accountImage);
	}
}
