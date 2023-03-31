import { EmbedColors } from '#utils/constants';
import { KBotErrors } from '#types/Enums';
import { getGuildIcon } from '#utils/Discord';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { GuildTextBasedChannel } from 'discord.js';
import type { UtilityModule } from '#modules/UtilityModule';
import type { UtilitySettings } from '#prisma';

@ApplyOptions<KBotCommandOptions>({
	module: 'UtilityModule',
	description: 'Get updates about Discord outages sent to a channel',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Discord Status')
			.setDescription('Get updates about Discord outages sent to a channel.')
			.setSubcommands([
				{ label: '/discordstatus set <channel>', description: 'Set the channel to send notifications to' }, //
				{ label: '/discordstatus unset', description: 'Unset the current channel' },
				{ label: '/discordstatus settings', description: 'Show the current settings' }
			]);
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('discordstatus')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set the channel to send notifications to')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send status updates to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset the current channel')
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

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'set': {
				return this.chatInputSet(interaction);
			}
			case 'unset': {
				return this.chatInputUnset(interaction);
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

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { client, validator } = this.container;
		const channel = interaction.options.getChannel('channel', true) as GuildTextBasedChannel;

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const settings = await this.module.upsertSettings(interaction.guildId, {
			incidentChannelId: channel.id
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.upsertSettings(interaction.guildId, {
			incidentChannelId: null
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, settings: UtilitySettings | null) {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Discord status settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`Channel: ${settings?.incidentChannelId ? channelMention(settings.incidentChannelId) : 'No channel set'}`)
			]
		});
	}
}
