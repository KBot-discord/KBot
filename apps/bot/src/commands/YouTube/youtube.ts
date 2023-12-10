import { isNullOrUndefined } from '#lib/utilities/functions';
import { YoutubeCustomIds } from '#lib/utilities/customIds';
import { fetchChannel, getGuildIcon } from '#lib/utilities/discord';
import { EmbedColors, KBotEmoji } from '#lib/utilities/constants';
import { KBotErrors, KBotModules } from '#lib/types/Enums';
import { YoutubeMenu } from '#lib/structures/menus/YoutubeMenu';
import { KBotSubcommand } from '#lib/extensions/KBotSubcommand';
import { MeiliCategories } from '@kbotdev/meili';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { ActionRowBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, channelMention } from 'discord.js';
import type { APISelectMenuOption, ApplicationCommandOptionChoiceData, BaseMessageOptions, Guild, GuildTextBasedChannel } from 'discord.js';
import type { YoutubeModule } from '#modules/YouTubeModule';
import type { DocumentYoutubeChannel } from '@kbotdev/meili';
import type { YoutubeSubscriptionWithChannel } from '#lib/services/types';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.YouTube,
	description: 'Add, remove, or edit YouTube subscriptions.',
	preconditions: ['Defer'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Youtube')
			.setSubcommands([
				{ label: '/youtube subscribe <account>', description: 'Subscribe to a new channel' }, //
				{ label: '/youtube unsubscribe <subscription>', description: 'Unsubscribe from a channel' },
				{
					label: '/youtube set <subscription> [message] [channel] [role] [member_channel] [member_role]',
					description: 'Set YouTube notification settings'
				},
				{
					label: '/youtube unset <subscription> [message] [channel] [role] [member_channel] [member_role]',
					description: 'Unset YouTube notification settings'
				},
				{ label: '/youtube toggle <value>', description: 'Enable or disable the youtube module' },
				{ label: '/youtube subscriptions', description: 'Show the current youtube subscriptions' }
			]);
	},
	subcommands: [
		{ name: 'subscribe', chatInputRun: 'chatInputSubscribe' },
		{ name: 'unsubscribe', chatInputRun: 'chatInputUnsubscribe' },
		{ name: 'set', chatInputRun: 'chatInputSet' },
		{ name: 'unset', chatInputRun: 'chatInputUnset' },
		{ name: 'role_reaction', chatInputRun: 'chatInputRoleReaction' },
		{ name: 'toggle', chatInputRun: 'chatInputToggle' },
		{ name: 'subscriptions', chatInputRun: 'chatInputSubscriptions' }
	]
})
export class NotificationsCommand extends KBotSubcommand<YoutubeModule> {
	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('youtube')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('subscribe')
							.setDescription('Subscribe to a new channel')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('Search the name of the channel and get an autocompleted list. Only channels on Holodex are supported')
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unsubscribe')
							.setDescription('Unsubscribe from a channel')
							.addStringOption((option) =>
								option //
									.setName('subscription')
									.setDescription('The YouTube subscription you want to remove')
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set YouTube notification settings')
							.addStringOption((option) =>
								option //
									.setName('subscription')
									.setDescription('The YouTube subscription you want to change settings for')
									.setRequired(true)
									.setAutocomplete(true)
							)
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('The message for the notification')
									.setRequired(false)
							)
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send notifications to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(false)
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping for notifications')
									.setRequired(false)
							)
							.addChannelOption((option) =>
								option //
									.setName('member_channel')
									.setDescription('The channel to send member notifications to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(false)
							)
							.addRoleOption((option) =>
								option //
									.setName('member_role')
									.setDescription('The role to ping for member notifications')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset YouTube notification settings')
							.addStringOption((option) =>
								option //
									.setName('subscription')
									.setDescription('The YouTube subscription you want to change settings for')
									.setRequired(true)
									.setAutocomplete(true)
							)
							.addBooleanOption((option) =>
								option //
									.setName('message')
									.setDescription('Reset the notification message to default')
									.setRequired(false)
							)
							.addBooleanOption((option) =>
								option //
									.setName('channel')
									.setDescription('Remove the channel that notifications are sent to')
									.setRequired(false)
							)
							.addBooleanOption((option) =>
								option //
									.setName('role')
									.setDescription('Remove the ping role')
									.setRequired(false)
							)
							.addBooleanOption((option) =>
								option //
									.setName('member_channel')
									.setDescription('Remove the channel that member notifications are sent to')
									.setRequired(false)
							)
							.addBooleanOption((option) =>
								option //
									.setName('member_role')
									.setDescription('Remove the member ping role')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('role_reaction')
							.setDescription('Automatically handle role reactions for youtube subscriptions')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send the role reaction embed to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable the youtube module')
							.addBooleanOption((option) =>
								option //
									.setName('value')
									.setDescription('True: the module is enabled. False: The module is disabled.')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('subscriptions')
							.setDescription('Show the current youtube subscriptions')
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async autocompleteRun(interaction: KBotSubcommand.AutocompleteInteraction): Promise<void> {
		const focusedOption = interaction.options.getFocused(true);
		let options: ApplicationCommandOptionChoiceData[];

		if (focusedOption.name === 'account') {
			const result = await this.container.meili.get<DocumentYoutubeChannel>(MeiliCategories.YoutubeChannels, focusedOption.value);

			options = result.hits.map(({ name, englishName, id }) => ({
				name: englishName ?? name,
				value: id
			}));
		} else if (focusedOption.name === 'subscription') {
			const channels = await this.module.subscriptions.getByGuild(interaction.guildId);
			if (isNullOrUndefined(channels)) return interaction.respond([]);

			options = channels.map(({ channelId, channel }) => ({
				name: channel.name,
				value: channelId
			}));
		} else {
			return interaction.respond([]);
		}

		return interaction.respond(options);
	}

	public async chatInputSubscribe(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('account', true);

		const exists = await this.module.subscriptions.exists(interaction.guildId, accountId);
		if (exists) {
			return interaction.errorReply('You are already subscribed to that channel.');
		}

		const subscriptionCount = await this.module.subscriptions.countByGuild(interaction.guildId);
		if (subscriptionCount >= 25) {
			return interaction.defaultReply('You can have a maximum of 25 subscriptions.');
		}

		const channel = await this.module.channels.get(accountId);
		if (isNullOrUndefined(channel)) {
			return interaction.errorReply('An account with that ID was not found');
		}

		const subscription = await this.module.subscriptions.upsert(interaction.guildId, accountId);

		return interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setThumbnail(channel.image)
					.setDescription(`Successfully subscribed to [${channel.name}](https://www.youtube.com/channel/${subscription.channel.youtubeId})`)
			]
		});
	}

	public async chatInputUnsubscribe(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('subscription', true);

		const subscription = await this.module.subscriptions.delete(interaction.guildId, accountId);
		if (!subscription) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		await this.updateReactionRoleMessage(interaction.guild);

		return interaction.successReply(`Successfully unsubscribed from ${subscription.channel.name}`);
	}

	public async chatInputSet(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('subscription', true);

		const exists = await this.module.subscriptions.exists(interaction.guildId, accountId);
		if (!exists) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		const message = interaction.options.getString('message') ?? undefined;
		const discordChannelId = interaction.options.getChannel('channel', false, [ChannelType.GuildText, ChannelType.GuildAnnouncement])?.id;
		const roleId = interaction.options.getRole('role')?.id;
		const memberDiscordChannelId = interaction.options.getChannel('member_channel', false, [ChannelType.GuildText, ChannelType.GuildAnnouncement])
			?.id;
		const memberRoleId = interaction.options.getRole('member_role')?.id;

		const subscription = await this.module.subscriptions.upsert(interaction.guildId, accountId, {
			message,
			discordChannelId,
			roleId,
			memberDiscordChannelId,
			memberRoleId
		});

		if (roleId || memberRoleId) {
			await this.updateReactionRoleMessage(interaction.guild);
		}

		return await this.showSettings(interaction, subscription);
	}

	public async chatInputUnset(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('subscription', true);

		const exists = await this.module.subscriptions.exists(interaction.guildId, accountId);
		if (!exists) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		const message = interaction.options.getBoolean('message');
		const channel = interaction.options.getBoolean('channel');
		const role = interaction.options.getBoolean('role');
		const memberChannel = interaction.options.getBoolean('member_channel');
		const memberRole = interaction.options.getBoolean('member_role');

		const subscription = await this.module.subscriptions.upsert(interaction.guildId, accountId, {
			message: message ? null : undefined,
			discordChannelId: channel ? null : undefined,
			roleId: role ? null : undefined,
			memberDiscordChannelId: memberChannel ? null : undefined,
			memberRoleId: memberRole ? null : undefined
		});

		if (role || memberRole) {
			await this.updateReactionRoleMessage(interaction.guild);
		}

		return await this.showSettings(interaction, subscription);
	}

	public async chatInputRoleReaction(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const bot = await interaction.guild.members.fetchMe();
		if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return interaction.defaultReply("I don't have the required permissions for role reactions to work.\n\nMissing permission: `Manage Roles`.");
		}

		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);
		const { result, error } = await this.container.validator.channels.canSendEmbeds(channel);
		if (!result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		await this.createReactionRoleMessage(interaction.guild, channel);

		return interaction.defaultReply(`Role reaction embed sent in ${channelMention(channel.id)}`);
	}

	public async chatInputToggle(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			enabled: value
		});

		const description = settings.enabled //
			? `${KBotEmoji.GreenCheck} module is now enabled`
			: `${KBotEmoji.RedX} module is now disabled`;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Youtube module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(description)
			]
		});
	}

	public async chatInputSubscriptions(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const subscriptions = await this.module.subscriptions.getByGuild(interaction.guildId);

		if (subscriptions.length === 0) {
			return interaction.defaultReply('There are no subscriptions to show.');
		}

		return new YoutubeMenu(subscriptions).run(interaction, interaction.user);
	}

	private async showSettings(
		interaction: KBotSubcommand.ChatInputCommandInteraction,
		subscription: YoutubeSubscriptionWithChannel
	): Promise<unknown> {
		const embed = this.module.buildSubscriptionEmbed(subscription);

		return interaction.editReply({
			embeds: [embed]
		});
	}

	/**
	 * Create a role reaction embed in the target channel.
	 * @param guild - The guild that the channel is in
	 * @param channel - The text channel
	 */
	private async createReactionRoleMessage(guild: Guild, channel: GuildTextBasedChannel): Promise<unknown> {
		const subscriptions = await this.module.subscriptions.getByGuild(guild.id);

		const messageOptions = await this.buildRoleReactionMessage(subscriptions);

		const message = await channel.send(messageOptions);

		await this.module.settings.upsert(guild.id, {
			reactionRoleMessageId: message.id,
			reactionRoleChannelId: message.channelId
		});

		return message;
	}

	/**
	 * Update the role reaction message with the updated subscription roles.
	 * @param guild - The guild that the message is in
	 */
	private async updateReactionRoleMessage(guild: Guild): Promise<unknown> {
		const settings = await this.module.settings.get(guild.id);
		if (isNullOrUndefined(settings) || isNullOrUndefined(settings.reactionRoleChannelId) || isNullOrUndefined(settings.reactionRoleMessageId)) {
			return;
		}

		const channel = await fetchChannel<GuildTextBasedChannel>(settings.reactionRoleChannelId);
		if (isNullOrUndefined(channel)) {
			return this.module.settings.upsert(guild.id, {
				reactionRoleMessageId: null,
				reactionRoleChannelId: null
			});
		}

		const subscriptions = await this.module.subscriptions.getByGuild(guild.id);

		const messageOptions = await this.buildRoleReactionMessage(subscriptions);
		const oldMessage = await channel.messages.fetch(settings.reactionRoleMessageId).catch(() => null);

		// Need to catch the edit since we dont have message intents/listeners
		const editMessage = await oldMessage?.edit(messageOptions).catch(() => null);

		if (isNullOrUndefined(editMessage)) {
			return this.module.settings.upsert(guild.id, {
				reactionRoleMessageId: null,
				reactionRoleChannelId: null
			});
		}

		return editMessage;
	}

	/**
	 * Build the message options from the guild's YouTube subscriptions and roles.
	 * @param subscriptions - The subscriptions
	 */
	private async buildRoleReactionMessage(subscriptions: YoutubeSubscriptionWithChannel[]): Promise<BaseMessageOptions> {
		const relevantSubscriptions = subscriptions.filter(({ roleId, memberRoleId }) => !isNullOrUndefined(roleId) || !isNullOrUndefined(memberRoleId));

		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
		const subscriptionsWithRoleIds = subscriptions.filter(({ roleId }) => !isNullOrUndefined(roleId));
		const subscriptionsWithMemberRoleIds = subscriptions.filter(({ memberRoleId }) => !isNullOrUndefined(memberRoleId));

		let roleString = '';
		if (subscriptionsWithRoleIds.length > 0 && subscriptionsWithMemberRoleIds.length > 0) {
			roleString = '\n\n**Top select menu:** Get notified for non-member streams.\n**Bottom select menu** Get notified for member streams.';
		} else if (subscriptionsWithRoleIds.length > 0) {
			roleString = '\n\nUse the select menu below to be notified for streams.';
		} else if (subscriptionsWithMemberRoleIds.length > 0) {
			roleString = '\n\nUse the select menu below to be notified for member streams.';
		}

		const description = this.createChannelList(relevantSubscriptions);

		if (subscriptionsWithRoleIds.length > 0) {
			const options = this.createStringMenuOptions(subscriptionsWithRoleIds);

			components.push(
				new ActionRowBuilder<StringSelectMenuBuilder>() //
					.setComponents([
						new StringSelectMenuBuilder() //
							.setCustomId(YoutubeCustomIds.RoleReaction)
							.setPlaceholder('Click here to select a role')
							.setOptions(options)
							.setMinValues(0)
							.setMaxValues(subscriptionsWithRoleIds.length)
					])
			);
		}

		if (subscriptionsWithMemberRoleIds.length > 0) {
			const memberOptions = this.createStringMenuOptions(subscriptionsWithMemberRoleIds);

			components.push(
				new ActionRowBuilder<StringSelectMenuBuilder>() //
					.setComponents([
						new StringSelectMenuBuilder() //
							.setCustomId(YoutubeCustomIds.RoleReactionMember)
							.setPlaceholder('Click here to select a member role')
							.setOptions(memberOptions)
							.setMinValues(0)
							.setMaxValues(subscriptionsWithMemberRoleIds.length)
					])
			);
		}

		return {
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.setTitle('YouTube Notification Pings')
					.setDescription(`Get notified whenever one of these channels goes live!${roleString}`),
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.setTitle('Channels')
					.setDescription(description)
			],
			components
		};
	}

	/**
	 * Create the embed description from the guild's YouTube subscriptions.
	 * @param subscriptions - The subscriptions
	 */
	private createChannelList(subscriptions: YoutubeSubscriptionWithChannel[]): string {
		if (subscriptions.length === 0) return 'There are no channels with roles set at the moment.';
		return subscriptions
			.map(({ channel }) => {
				return `[${channel.name}](https://www.youtube.com/channel/${channel.youtubeId})`;
			})
			.join('\n');
	}

	/**
	 * Create the select menu options from the guild's YouTube subscriptions.
	 * @param subscriptions - The subscriptions
	 */
	private createStringMenuOptions(subscriptions: YoutubeSubscriptionWithChannel[]): APISelectMenuOption[] {
		return subscriptions.map(({ channel }) => {
			return { label: channel.name, value: channel.youtubeId };
		});
	}
}
