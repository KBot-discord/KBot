import { TwitchMenu } from '#structures/menus/TwitchMenu';
import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import type { TwitchModule } from '#modules/TwitchModule';
import type { TwitchSubWithAcc } from '#types/database/Twitch';

@ApplyOptions<ModuleCommand.Options>({
	module: 'TwitchModule',
	description: 'Add, remove, or edit Twitch subscriptions.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true
	}
})
export class NotificationsCommand extends ModuleCommand<TwitchModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/notifications toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('twitch')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('subscribe')
							.setDescription('Subscribe to a new account')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('The name of the Twitch account you want to subscribe to (example: amanekanata_hololive)')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unsubscribe')
							.setDescription('Unsubscribe from an account')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('The Twitch account you want to unsubscribe from')
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set Twitch notification settings')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('The Twitch account you want to change settings for')
									.setRequired(true)
									.setAutocomplete(true)
							)
							.addBooleanOption((option) =>
								option //
									.setName('enabled')
									.setDescription('If the subscription should be enabled')
									.setRequired(false)
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
							.setDescription('Unset Twitch notification settings')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('The Twitch account you want to change settings for')
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
							.setDescription('Enable or disable the twitch module')
							.addBooleanOption((option) =>
								option //
									.setName('value')
									.setDescription('True: the module is enabled. False: The module is disabled.')
									.setRequired(false)
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

		try {
			const accounts = await this.module.fetchApiAccounts([accountId]);
			if (accounts.length === 0) {
				return interaction.errorReply('An account with that name was not found');
			}

			const account = accounts[0];

			const subscriptionCount = await this.module.subscriptions.countByAccount({ accountId });
			if (subscriptionCount === 0) {
				const response = await this.module.addApiSubscription(account.id);
				// TODO handle error
				if (!response) return;

				await this.module.accounts.create({
					id: account.login,
					name: account.display_name,
					image: account.profile_image_url,
					twitchSubscriptionId: response
				});
			}

			const subscription = await this.module.subscriptions.create({
				guildId: interaction.guildId,
				accountId: account.id
			});

			if (!subscription) {
				return interaction.errorReply('There was an error when trying to add your subscription.');
			}

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	public async chatInputUnsubscribe(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const accountId = interaction.options.getString('account', true);

		try {
			const accountExists = await this.module.accounts.exists({ accountId });
			if (!accountExists) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscriptionCount = await this.module.subscriptions.countByAccount({ accountId });
			if (subscriptionCount < 2) {
				const account = await this.module.accounts.delete({
					accountId
				});
				if (!account) return;

				await this.module.removeApiSubscription(account.twitchSubscriptionId);
			}

			const subscription = await this.module.subscriptions.delete({
				guildId: interaction.guildId,
				accountId
			});
			if (isNullish(subscription)) {
				return interaction.errorReply('There was an error when removing your subscription.');
			}

			return interaction.defaultReply(`Successfully unsubscribed from ${subscription.account.name}`);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const accountId = interaction.options.getString('account', true);
		const message = interaction.options.getString('message') ?? undefined;
		const discordChannel = interaction.options.getChannel('channel')?.id;
		const role = interaction.options.getRole('role')?.id;

		try {
			const exists = await this.module.accounts.exists({ accountId });
			if (!exists) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscription = await this.module.subscriptions.update(
				{ guildId: interaction.guildId, accountId },
				{
					message,
					discordChannel,
					role
				}
			);

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const accountId = interaction.options.getString('account', true);
		const message = interaction.options.getBoolean('message');
		const channel = interaction.options.getBoolean('channel');
		const role = interaction.options.getBoolean('role');

		const newMessage = message ? null : undefined;
		const newChannel = channel ? null : undefined;
		const newRole = role ? null : undefined;

		try {
			const exists = await this.module.accounts.exists({ accountId });
			if (!exists) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscription = await this.module.subscriptions.update(
				{ guildId: interaction.guildId, accountId },
				{
					message: newMessage,
					discordChannel: newChannel,
					role: newRole
				}
			);

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
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
					.setAuthor({ name: 'Twitch module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? Emoji.GreenCheck : Emoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		try {
			const subscriptions = await this.module.subscriptions.getByGuild({
				guildId: interaction.guildId
			});

			return new TwitchMenu(interaction.guild, subscriptions).run(interaction, interaction.user);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, subscription: TwitchSubWithAcc) {
		return interaction.editReply({
			embeds: [this.container.twitch.buildSubscriptionEmbed(interaction.guild, subscription)]
		});
	}
}
