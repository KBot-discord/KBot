import { YoutubeMenu } from '#structures/menus/YoutubeMenu';
import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { YoutubeModule } from '#modules/YoutubeModule';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import type { YoutubeSubscriptionWithChannel } from '#types/database';

@ApplyOptions<KBotCommandOptions>({
	module: 'YoutubeModule',
	description: 'Add, remove, or edit Youtube subscriptions.',
	preconditions: ['ModuleEnabled'],
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
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unsubscribe')
							.setDescription('Unsubscribe from a channel')
							.addStringOption((option) =>
								option //
									.setName('account')
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
									.setName('account')
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
									.addChannelTypes(ChannelType.GuildText)
									.setRequired(false)
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping for notifications')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset YouTube notification settings')
							.addStringOption((option) =>
								option //
									.setName('account')
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
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public override async autocompleteRun(interaction: ModuleCommand.AutocompleteInteraction<'cached'>): Promise<void> {
		// TODO: Cache this?
		const channels = await this.module.subscriptions.getByGuild({
			guildId: interaction.guildId
		});
		if (isNullish(channels)) return interaction.respond([]);

		const channelOptions: ApplicationCommandOptionChoiceData[] = channels.map(({ id, channel }) => ({ name: channel.name, value: id }));

		return interaction.respond(channelOptions);
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
		const accountId = interaction.options.getString('account', true);

		if (YoutubeModule.isYoutubeChannelNameValid(accountId)) {
			return interaction.defaultReply('That channel ID is not valid.');
		}

		const exists = await this.module.channels.exists({
			channelId: accountId
		});
		if (exists) {
			const subCount = await this.module.channels.subscriptionCount({ channelId: accountId });
			if (subCount === 0) {
				await this.module.pubsubSubscribe(accountId);
			}
		} else {
			const apiAccount = await this.module.fetchApiChannel(accountId);
			if (!apiAccount) {
				return interaction.errorReply('An account with that ID was not found');
			}

			await this.module.pubsubSubscribe(accountId);
		}

		const subscription = await this.module.subscriptions.create({
			guildId: interaction.guildId,
			channelId: accountId
		});
		if (isNullish(subscription)) {
			return interaction.errorReply('There was an error when creating your subscription.');
		}

		return this.showSettings(interaction, subscription);
	}

	public async chatInputUnsubscribe(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const accountId = interaction.options.getString('account', true);

		const subscription = await this.module.subscriptions.delete({
			guildId: interaction.guildId,
			channelId: accountId
		});
		if (isNullish(subscription)) {
			return interaction.errorReply('There was an error when removing your subscription.');
		}

		const count = await this.module.channels.subscriptionCount({ channelId: accountId });
		if (!count || count === 0) {
			await this.module.pubsubUnsubscribe(accountId);
		}

		return interaction.defaultReply(`Successfully unsubscribed from ${subscription.channel.name}`);
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const accountId = interaction.options.getString('account', true);

		const message = interaction.options.getString('message') ?? undefined;
		const channelId = interaction.options.getChannel('channel')?.id;
		const roleId = interaction.options.getRole('role')?.id;

		const subscription = await this.module.subscriptions.update(
			{ guildId: interaction.guildId, channelId: accountId },
			{
				message,
				discordChannel: channelId,
				role: roleId
			}
		);
		if (isNullish(subscription)) {
			return interaction.errorReply('There was an error when updating your subscription.');
		}

		return this.showSettings(interaction, subscription);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const accountId = interaction.options.getString('account', true);

		const message = interaction.options.getBoolean('message');
		const channel = interaction.options.getBoolean('channel');
		const role = interaction.options.getBoolean('role');

		const newMessage = message ? null : undefined;
		const newChannel = channel ? null : undefined;
		const newRole = role ? null : undefined;

		const subscription = await this.module.subscriptions.update(
			{ guildId: interaction.guildId, channelId: accountId },
			{
				message: newMessage,
				discordChannel: newChannel,
				role: newRole
			}
		);
		if (isNullish(subscription)) {
			return interaction.errorReply('There was an error when updating your subscription.');
		}

		return this.showSettings(interaction, subscription);
	}

	public async chatInputToggle(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
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
			embeds: [this.container.youtube.buildSubscriptionEmbed(interaction.guild, subscription)]
		});
	}
}
