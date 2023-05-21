import { YoutubeMenu } from '#structures/menus/YoutubeMenu';
import { EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { MeiliCategories } from '#types/Meili';
import { YoutubeCustomIds } from '#utils/customIds';
import { KBotErrors } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import { ActionRowBuilder, channelMention, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import type { APISelectMenuOption } from 'discord-api-types/v10';
import type { YoutubeModule } from '#modules/YoutubeModule';
import type { DocumentYoutubeChannel } from '#types/Meili';
import type { ApplicationCommandOptionChoiceData, GuildTextBasedChannel, BaseMessageOptions, Guild } from 'discord.js';
import type { YoutubeSubscriptionWithChannel } from '@kbotdev/database';

@ApplyOptions<KBotCommand.Options>({
	description: 'Add, remove, or edit Youtube subscriptions.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Youtube')
			.setDescription('Add, remove, or edit Youtube subscriptions.')
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
	}
})
export class NotificationsCommand extends KBotCommand<YoutubeModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.youtube);
	}

	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/notifications toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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

	public override async autocompleteRun(interaction: KBotCommand.AutocompleteInteraction): Promise<void> {
		const focusedOption = interaction.options.getFocused(true);
		let options: ApplicationCommandOptionChoiceData[];

		if (focusedOption.name === 'account') {
			const result = await this.container.meili.get<DocumentYoutubeChannel>(MeiliCategories.YoutubeChannels, focusedOption.value);

			options = result.hits.map(({ name, englishName, id }) => ({
				name: englishName ?? name,
				value: id
			}));
		} else if (focusedOption.name === 'subscription') {
			const channels = await this.module.subscriptions.getByGuild({
				guildId: interaction.guildId
			});
			if (isNullish(channels)) return interaction.respond([]);

			options = channels.map(({ channelId, channel }) => ({
				name: channel.name,
				value: channelId
			}));
		} else {
			return interaction.respond([]);
		}

		return interaction.respond(options);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'subscribe':
				return this.chatInputSubscribe(interaction);
			case 'unsubscribe':
				return this.chatInputUnsubscribe(interaction);
			case 'set':
				return this.chatInputSet(interaction);
			case 'unset':
				return this.chatInputUnset(interaction);
			case 'role_reaction':
				return this.chatInputRoleReaction(interaction);
			case 'toggle':
				return this.chatInputToggle(interaction);
			case 'subscriptions':
				return this.chatInputSubscriptions(interaction);
			default:
				return this.unknownSubcommand(interaction);
		}
	}

	public async chatInputSubscribe(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('account', true);

		const exists = await this.module.subscriptions.exists({
			channelId: accountId,
			guildId: interaction.guildId
		});
		if (exists) {
			return interaction.errorReply('You are already subscribed to that channel.');
		}

		const subscriptionCount = await this.module.subscriptions.countByGuild({
			guildId: interaction.guildId
		});
		if (subscriptionCount >= 25) {
			return interaction.defaultReply('You can have a maximum of 25 subscriptions.');
		}

		const channel = await this.container.prisma.holodexChannel.findUnique({
			where: { youtubeId: accountId }
		});
		if (isNullish(channel)) {
			return interaction.errorReply('An account with that ID was not found');
		}

		const subscription = await this.module.subscriptions.upsert({
			guildId: interaction.guildId,
			channelId: accountId
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setThumbnail(channel.image)
					.setDescription(`Successfully subscribed to [${channel.name}](https://www.youtube.com/channel/${subscription.channel.youtubeId})`)
			]
		});
	}

	public async chatInputUnsubscribe(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('subscription', true);

		const subscription = await this.module.subscriptions.delete({
			guildId: interaction.guildId,
			channelId: accountId
		});
		if (!subscription) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		await this.updateReactionRoleMessage(interaction.guild);

		return interaction.successReply(`Successfully unsubscribed from ${subscription.channel.name}`);
	}

	public async chatInputSet(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('subscription', true);

		const exists = await this.module.subscriptions.exists({
			channelId: accountId,
			guildId: interaction.guildId
		});
		if (!exists) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		const message = interaction.options.getString('message') ?? undefined;
		const discordChannelId = interaction.options.getChannel('channel', false, [ChannelType.GuildText, ChannelType.GuildAnnouncement])?.id;
		const roleId = interaction.options.getRole('role')?.id;
		const memberDiscordChannelId = interaction.options.getChannel('member_channel', false, [
			ChannelType.GuildText,
			ChannelType.GuildAnnouncement
		])?.id;
		const memberRoleId = interaction.options.getRole('member_role')?.id;

		const subscription = await this.module.subscriptions.upsert(
			{ guildId: interaction.guildId, channelId: accountId },
			{
				message,
				discordChannelId,
				roleId,
				memberDiscordChannelId,
				memberRoleId
			}
		);

		if (roleId || memberRoleId) {
			await this.updateReactionRoleMessage(interaction.guild);
		}

		return this.showSettings(interaction, subscription);
	}

	public async chatInputUnset(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const accountId = interaction.options.getString('subscription', true);

		const exists = await this.module.subscriptions.exists({
			channelId: accountId,
			guildId: interaction.guildId
		});
		if (!exists) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		const message = interaction.options.getBoolean('message');
		const channel = interaction.options.getBoolean('channel');
		const role = interaction.options.getBoolean('role');
		const memberChannel = interaction.options.getBoolean('member_channel');
		const memberRole = interaction.options.getBoolean('member_role');

		const subscription = await this.module.subscriptions.upsert(
			{ guildId: interaction.guildId, channelId: accountId },
			{
				message: message ? null : undefined,
				discordChannelId: channel ? null : undefined,
				roleId: role ? null : undefined,
				memberDiscordChannelId: memberChannel ? null : undefined,
				memberRoleId: memberRole ? null : undefined
			}
		);

		if (role || memberRole) {
			await this.updateReactionRoleMessage(interaction.guild);
		}

		return this.showSettings(interaction, subscription);
	}

	public async chatInputRoleReaction(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
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

	public async chatInputToggle(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
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

	public async chatInputSubscriptions(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const subscriptions = await this.module.subscriptions.getByGuild({
			guildId: interaction.guildId
		});

		return new YoutubeMenu(subscriptions).run(interaction, interaction.user);
	}

	private async showSettings(interaction: KBotCommand.ChatInputCommandInteraction, subscription: YoutubeSubscriptionWithChannel): Promise<unknown> {
		const embed = this.module.buildSubscriptionEmbed(subscription);

		return interaction.editReply({
			embeds: [embed]
		});
	}

	private async createReactionRoleMessage(guild: Guild, channel: GuildTextBasedChannel): Promise<unknown> {
		const subscriptions = await this.module.subscriptions.getByGuild({
			guildId: guild.id
		});

		const messageOptions = await this.buildRoleReactionMessage(subscriptions);

		const message = await channel.send(messageOptions);

		await this.module.settings.upsert(guild.id, {
			reactionRoleMessageId: message.id,
			reactionRoleChannelId: message.channelId
		});

		return message;
	}

	private async updateReactionRoleMessage(guild: Guild): Promise<unknown> {
		const settings = await this.module.settings.get(guild.id);
		if (!settings?.reactionRoleChannelId || !settings.reactionRoleMessageId) return;

		const channel = (await guild.channels.fetch(settings.reactionRoleChannelId)) as GuildTextBasedChannel | null;
		if (!channel) {
			return this.module.settings.upsert(guild.id, {
				reactionRoleMessageId: null,
				reactionRoleChannelId: null
			});
		}

		const subscriptions = await this.module.subscriptions.getByGuild({
			guildId: guild.id
		});

		const messageOptions = await this.buildRoleReactionMessage(subscriptions);
		const oldMessage = await channel.messages.fetch(settings.reactionRoleMessageId).catch(() => null);

		// Need to catch the edit since we dont have message intents/listeners
		const editMessage = await oldMessage?.edit(messageOptions).catch(() => null);

		if (!editMessage) {
			return this.module.settings.upsert(guild.id, {
				reactionRoleMessageId: null,
				reactionRoleChannelId: null
			});
		}

		return editMessage;
	}

	private async buildRoleReactionMessage(subscriptions: YoutubeSubscriptionWithChannel[]): Promise<BaseMessageOptions> {
		const relevantSubscriptions = subscriptions.filter(({ roleId, memberRoleId }) => !isNullish(roleId) || !isNullish(memberRoleId));

		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
		const subscriptionsWithRoleIds = subscriptions.filter(({ roleId }) => !isNullish(roleId));
		const subscriptionsWithMemberRoleIds = subscriptions.filter(({ memberRoleId }) => !isNullish(memberRoleId));

		let roleString = '';
		if (subscriptionsWithRoleIds.length > 0 && subscriptionsWithMemberRoleIds.length > 0) {
			roleString = '\n\n**Top select menu:** Get notified for non-member streams.\n**Bottom select menu** Get notified for member streams.';
		} else if (subscriptionsWithRoleIds.length > 0) {
			roleString = '\n\nUse the select menu below to be notified for streams.';
		} else if (subscriptionsWithMemberRoleIds.length > 0) {
			roleString = '\n\nUse the select menu below to be notified for member streams.';
		}

		const description = this.createRoleReactionDescription(relevantSubscriptions);

		if (subscriptionsWithRoleIds.length > 0) {
			const options = this.createRoleReactionOptions(subscriptionsWithRoleIds);

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
			const memberOptions = this.createRoleReactionOptions(subscriptionsWithMemberRoleIds);

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
					.setDescription(description.length > 0 ? description : 'There are no channels with roles set at the moment.')
			],
			components
		};
	}

	private createRoleReactionDescription(subscriptions: YoutubeSubscriptionWithChannel[]): string {
		return subscriptions
			.map(({ channel }) => {
				return `[${channel.name}](https://www.youtube.com/channel/${channel.youtubeId})`;
			})
			.join('\n');
	}

	private createRoleReactionOptions(subscriptions: YoutubeSubscriptionWithChannel[]): APISelectMenuOption[] {
		return subscriptions.map(({ channel }) => {
			return { label: channel.name, value: channel.youtubeId };
		});
	}
}
