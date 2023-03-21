import { YoutubeMenu } from '#structures/menus/YoutubeMenu';
import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { MeiliCategories } from '#types/Meili';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import type { YoutubeModule } from '#modules/YoutubeModule';
import type { DocumentYoutubeChannel } from '#types/Meili';
import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import type { YoutubeSubscriptionWithChannel } from '#types/database';

@ApplyOptions<KBotCommandOptions>({
	module: 'YoutubeModule',
	description: 'Add, remove, or edit Youtube subscriptions.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Youtube')
			.setDescription('Add, remove, or edit Youtube subscriptions.')
			.setSubcommands([
				{ label: '/youtube subscribe <account>', description: 'Subscribe to a new channel' }, //
				{ label: '/youtube unsubscribe <account>', description: 'Unsubscribe from a channel' },
				{ label: '/youtube set <account> [enabled] [message] [channel] [role]', description: 'Set YouTube notification settings' },
				{ label: '/youtube unset <account> [message] [channel] [role]', description: 'Unset YouTube notification settings' },
				{ label: '/youtube toggle <value>', description: 'Enable or disable the youtube module' },
				{ label: '/youtube settings', description: 'Show the current settings' }
			]);
	}
})
export class NotificationsCommand extends KBotCommand<YoutubeModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/notifications toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
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
									.setDescription('The ID of the YouTube account you want to subscribe to. (example: UCZlDXzGoo7d44bwdNObFacg)')
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
									.setDescription('The YouTube account you want to unsubscribe from')
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
									.setDescription('The YouTube account you want to change settings for')
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
									.setDescription('The YouTube account you want to change settings for')
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
									.setName('memberrole')
									.setDescription('Remove the member ping role')
									.setRequired(false)
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
							.setName('settings')
							.setDescription('Show the current settings')
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async autocompleteRun(interaction: ModuleCommand.AutocompleteInteraction<'cached'>): Promise<void> {
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

			options = channels.map(({ channelId, channel }) => ({ name: channel.name, value: channelId }));
		} else {
			return interaction.respond([]);
		}

		return interaction.respond(options);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'subscribe': {
				return this.chatInputSubscribe(interaction);
			}
			case 'unsubscribe': {
				return this.chatInputUnsubscribe(interaction);
			}
			case 'set': {
				return this.chatInputSet(interaction);
			}
			case 'unset': {
				return this.chatInputUnset(interaction);
			}
			case 'toggle': {
				return this.chatInputToggle(interaction);
			}
			case 'settings': {
				return this.chatInputSettings(interaction);
			}
			default: {
				this.container.logger.fatal(`[${this.name}] Hit default switch in`);
				return interaction.errorReply('Something went wrong.');
			}
		}
	}

	public async chatInputSubscribe(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

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
					.setColor(EmbedColors.Default)
					.setThumbnail(channel.image)
					.setDescription(`Successfully subscribed to [${channel.name}](https://www.youtube.com/channel/${subscription.channel.youtubeId})`)
			]
		});
	}

	public async chatInputUnsubscribe(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const accountId = interaction.options.getString('subscription', true);

		const subscription = await this.module.subscriptions.delete({
			guildId: interaction.guildId,
			channelId: accountId
		});
		if (!subscription) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		return interaction.defaultReply(`Successfully unsubscribed from ${subscription.channel.name}`);
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const accountId = interaction.options.getString('subscription', true);

		const exists = await this.module.subscriptions.exists({
			channelId: accountId,
			guildId: interaction.guildId
		});
		if (!exists) {
			return interaction.errorReply('You are not subscribed to that channel.');
		}

		const message = interaction.options.getString('message') ?? undefined;
		const discordChannelId = interaction.options.getChannel('channel')?.id;
		const roleId = interaction.options.getRole('role')?.id;
		const memberDiscordChannelId = interaction.options.getChannel('member_channel')?.id;
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

		return this.showSettings(interaction, subscription);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

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

		const newMessage = message ? null : undefined;
		const newChannel = channel ? null : undefined;
		const newRole = role ? null : undefined;
		const newMemberChannel = memberChannel ? null : undefined;
		const newMemberRole = memberRole ? null : undefined;

		const subscription = await this.module.subscriptions.upsert(
			{ guildId: interaction.guildId, channelId: accountId },
			{
				message: newMessage,
				discordChannelId: newChannel,
				roleId: newRole,
				memberDiscordChannelId: newMemberChannel,
				memberRoleId: newMemberRole
			}
		);

		return this.showSettings(interaction, subscription);
	}

	public async chatInputToggle(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.upsertSettings(interaction.guildId, {
			enabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Youtube module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? Emoji.GreenCheck : Emoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const subscriptions = await this.module.subscriptions.getByGuild({
			guildId: interaction.guildId
		});

		return new YoutubeMenu(interaction.guild, subscriptions).run(interaction, interaction.user);
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, subscription: YoutubeSubscriptionWithChannel) {
		return interaction.editReply({
			embeds: [this.container.youtube.buildSubscriptionEmbed(subscription)]
		});
	}
}
