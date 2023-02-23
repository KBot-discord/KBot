import { YoutubeMenu } from '#lib/structures/menus/YoutubeMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { Subscription } from '#rpc/youtube';
import type { NotificationModule } from '#modules/NotificationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'NotificationModule',
	description: 'Add, remove, or edit Youtube subscriptions.',
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
					.setName('youtube')
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
		const { youtube } = this.module;

		const accountId = interaction.options.getString('account', true);

		try {
			const account = await youtube.getChannel(accountId);
			if (isNullish(account)) {
				return interaction.errorReply('An account with that ID was not found');
			}

			const subscription = await youtube.createSubscription(interaction.guildId, accountId);
			if (isNullish(subscription)) {
				return interaction.errorReply('There was an error when creating your subscription.');
			}

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}
	}

	public async chatInputUnsubscribe(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { youtube } = this.module;

		const accountId = interaction.options.getString('account', true);

		try {
			const subscription = await youtube.deleteSubscription(interaction.guildId, accountId);
			if (isNullish(subscription)) {
				return interaction.errorReply('There was an error when removing your subscription.');
			}

			return interaction.defaultReply(`Successfully unsubscribed from ${subscription.channelName}`);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { youtube } = this.module;

		const accountId = interaction.options.getString('account', true);

		const message = interaction.options.getString('message') ?? undefined;
		const channelId = interaction.options.getChannel('channel')?.id;
		const roleId = interaction.options.getRole('role')?.id;

		try {
			const subscription = await youtube.updateSubscription(interaction.guildId, accountId, message, channelId, roleId);
			if (isNullish(subscription)) {
				return interaction.errorReply('There was an error when updating your subscription.');
			}

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { youtube } = this.module;

		const accountId = interaction.options.getString('account', true);

		const message = interaction.options.getBoolean('message');
		const channel = interaction.options.getBoolean('channel');
		const role = interaction.options.getBoolean('role');

		const newMessage = message ? null : undefined;
		const newChannel = channel ? null : undefined;
		const newRole = role ? null : undefined;

		try {
			const subscription = await youtube.updateSubscription(interaction.guildId, accountId, newMessage, newChannel, newRole);
			if (isNullish(subscription)) {
				return interaction.errorReply('There was an error when updating your subscription.');
			}

			return this.showSettings(interaction, subscription);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { youtube } = this.module;

		try {
			const subscriptions = await youtube.getGuildSubscriptions(interaction.guildId);

			return new YoutubeMenu(interaction.guild, subscriptions).run(interaction, interaction.user);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, subscription: Subscription) {
		return interaction.editReply({
			embeds: [this.container.notifications.youtube.buildSubscriptionEmbed(interaction.guild, subscription)]
		});
	}
}
