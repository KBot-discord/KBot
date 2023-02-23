import { TwitchMenu } from '#lib/structures/menus/TwitchMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { NotificationModule } from '#modules/NotificationModule';
import type { TwitchSubWithAcc } from '#types/repositories/TwitchRepository';

@ApplyOptions<ModuleCommand.Options>({
	module: 'NotificationModule',
	description: 'Add, remove, or edit Twitch subscriptions.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true
	}
})
export class NotificationsCommand extends ModuleCommand<NotificationModule> {
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
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
			default: {
				return this.chatInputSettings(interaction);
			}
		}
	}

	public async chatInputSubscribe(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { twitch } = this.module;

		const accountId = interaction.options.getString('account', true);

		try {
			const accounts = await twitch.fetchApiAccounts([accountId]);
			if (accounts.length === 0) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscription = await twitch.createSubscription(interaction.guildId, accounts[0].id, {
				name: accounts[0].display_name,
				image: accounts[0].profile_image_url
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
		const { twitch } = this.module;

		const accountId = interaction.options.getString('account', true);

		try {
			const exists = await twitch.accountExists(accountId);
			if (!exists) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscription = await twitch.deleteSubscription(interaction.guildId, accountId);
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
		const { twitch } = this.module;

		const accountId = interaction.options.getString('account', true);
		const message = interaction.options.getString('message') ?? undefined;
		const discordChannel = interaction.options.getChannel('channel')?.id;
		const role = interaction.options.getRole('role')?.id;

		try {
			const exists = await twitch.accountExists(accountId);
			if (!exists) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscription = await twitch.updateSubscription(interaction.guildId, accountId, {
				message,
				discordChannel,
				role
			});

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { twitch } = this.module;

		const accountId = interaction.options.getString('account', true);
		const message = interaction.options.getBoolean('message');
		const channel = interaction.options.getBoolean('channel');
		const role = interaction.options.getBoolean('role');

		const newMessage = message ? null : undefined;
		const newChannel = channel ? null : undefined;
		const newRole = role ? null : undefined;

		try {
			const exists = await twitch.accountExists(accountId);
			if (!exists) {
				return interaction.errorReply('An account with that name was not found');
			}

			const subscription = await twitch.updateSubscription(interaction.guildId, accountId, {
				message: newMessage,
				discordChannel: newChannel,
				role: newRole
			});

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { twitch } = this.module;

		try {
			const subscriptions = await twitch.getGuildSubscriptions(interaction.guildId);

			return new TwitchMenu(interaction.guild, subscriptions).run(interaction, interaction.user);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Twitch module is down at the moment.");
		}
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, subscription: TwitchSubWithAcc) {
		return interaction.editReply({
			embeds: [this.container.notifications.twitch.buildSubscriptionEmbed(interaction.guild, subscription)]
		});
	}
}
