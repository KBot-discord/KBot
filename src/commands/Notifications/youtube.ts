import { EmbedColors } from '#utils/constants';
import { getGuildIds } from '#utils/config';
import { YoutubeMenu } from '#lib/structures/YoutubeMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageEmbed } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { NotificationModule } from '../../modules/NotificationModule';
import type { Subscription } from '../../rpc/gen/subscriptions/v1/subscriptions.pb';

@ApplyOptions<ModuleCommand.Options>({
	module: 'NotificationModule',
	description: 'Youtube module',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class NotificationCommand extends ModuleCommand<NotificationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('youtube')
					.setDescription('Have YouTube stream notifications posted to a channel')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('subscribe')
							.setDescription('Subscribe to a new channel')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('Which YouTube account you want to subscribe to')
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unsubscribe')
							.setDescription('Unsubscribe from an old channel')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('Which YouTube account you want to unsubscribe from')
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
									.setDescription('Which YouTube account you want to change settings for')
									.setRequired(true)
									.setAutocomplete(true)
							)
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('The message for the notification')
							)
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send notifications to')
									.addChannelTypes(ChannelType.GuildText)
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping for notifications')
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset the current channel')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('Which YouTube account you want to change settings for')
									.setRequired(true)
									.setAutocomplete(true)
							)
							.addBooleanOption((option) =>
								option //
									.setName('message')
									.setDescription('Reset the notification message to default')
							)
							.addBooleanOption((option) =>
								option //
									.setName('channel')
									.setDescription('Remove the channel that notifications are sent to')
							)
							.addBooleanOption((option) =>
								option //
									.setName('role')
									.setDescription('Remove the ping role')
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('config')
							.setDescription('Show the current config')
					),
			{ idHints: ['1055671595676479518'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputInteraction) {
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
				return this.chatInputConfig(interaction);
			}
		}
	}

	public async chatInputSubscribe(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { youtube } = this.container;

		const account = interaction.options.getString('account', true);

		const channel = await youtube.getChannel(account);
		if (channel === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		if (channel.name === '') {
			return interaction.errorReply('A channel with that name was not found');
		}

		const newSubscription = await youtube.postSubscription(interaction.guildId!, account, '', '', '');
		if (newSubscription === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		return this.showNewConfig(interaction, newSubscription);
	}

	public async chatInputUnsubscribe(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { youtube } = this.container;

		const account = interaction.options.getString('account', true);

		const success = await youtube.deleteSubscription(interaction.guildId!, account);
		if (!success) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		return interaction.defaultReply(`Successfully unsubscribed from ${account}`);
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { youtube } = this.container;

		const account = interaction.options.getString('account', true);
		const message = interaction.options.getString('message');
		const channel = interaction.options.getChannel('channel')?.id;
		const role = interaction.options.getRole('role')?.id;

		const oldSubscription = await youtube.getSubscription(interaction.guildId!, account);
		if (oldSubscription === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		const newMessage = message ?? oldSubscription.message;
		const newChannel = channel ?? oldSubscription.discordChannel;
		const newRole = role ?? oldSubscription.role;

		const newSubscription = await youtube.postSubscription(interaction.guildId!, account, newMessage, newChannel, newRole);
		if (newSubscription === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		return this.showNewConfig(interaction, newSubscription);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { youtube } = this.container;

		const account = interaction.options.getString('account', true);
		const message = interaction.options.getString('message');
		const channel = interaction.options.getChannel('channel')?.id;
		const role = interaction.options.getRole('role')?.id;

		const oldSubscription = await youtube.getSubscription(interaction.guildId!, account);
		if (oldSubscription === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		const newMessage = message ? null : oldSubscription.message;
		const newChannel = channel ? null : oldSubscription.discordChannel;
		const newRole = role ? null : oldSubscription.role;

		const newSubscription = await youtube.postSubscription(interaction.guildId!, account, newMessage, newChannel, newRole);
		if (newSubscription === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		return this.showNewConfig(interaction, newSubscription);
	}

	public async chatInputConfig(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { youtube } = this.container;

		const subscriptions = await youtube.getGuildSubscriptions(interaction.guildId!);
		if (subscriptions === null) {
			return interaction.errorReply("KBot's Youtube module is down at the moment.");
		}

		return new YoutubeMenu(interaction.guild!, subscriptions).run(interaction, interaction.user);
	}

	private showNewConfig(interaction: ModuleCommand.ChatInputInteraction, subscription: Subscription) {
		return interaction.editReply({
			embeds: [
				new MessageEmbed() //
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'YouTube notifications config', iconURL: interaction.guild!.iconURL()! })
					.setTitle(subscription.channelName)
					.setFields([
						{ name: 'Message', value: subscription.message },
						{ name: 'Channel', value: channelMention(subscription.discordChannel) },
						{ name: 'Role', value: roleMention(subscription.role) }
					])
					.setThumbnail(subscription.channelImage)
			]
		});
	}
}
