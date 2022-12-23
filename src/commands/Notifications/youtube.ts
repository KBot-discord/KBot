import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';

@ApplyOptions<Subcommand.Options>({
	description: 'Discord status',
	subcommands: [
		{ name: 'set', chatInputRun: 'chatInputSet' },
		{ name: 'unset', chatInputRun: 'chatInputUnset' },
		{ name: 'config', chatInputRun: 'chatInputConfig' }
	],
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class DiscordStatusCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('youtube')
					.setDescription('Have notifications about Discord outages sent to a channel')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set YouTube notification settings')
							.addStringOption((option) =>
								option //
									.setName('account')
									.setDescription('Which YouTube account you want to follow')
									.setRequired(true)
									.setAutocomplete(true)
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping for notifications')
							)
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send notifications to')
									.addChannelTypes(ChannelType.GuildText)
							)
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('The message for the notification')
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
									.setName('remove_all')
									.setDescription('Remove all settings for this account')
							)
							.addBooleanOption((option) =>
								option //
									.setName('role')
									.setDescription('Remove the ping role')
							)
							.addBooleanOption((option) =>
								option //
									.setName('channel')
									.setDescription('Remove the channel that notifications are sent to')
							)
							.addBooleanOption((option) =>
								option //
									.setName('message')
									.setDescription('Reset the notification message to default')
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

	public async chatInputSet() {}

	public async chatInputUnset() {}

	public async chatInputConfig() {}
}
