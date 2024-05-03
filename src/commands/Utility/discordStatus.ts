import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import { KBotErrors, KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { getGuildIcon } from '../../lib/utilities/discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { UtilitySettings } from '@prisma/client';
import type { UtilityModule } from '../../modules/UtilityModule.js';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Utility,
	description: 'Get updates about Discord outages sent to a channel.',
	preconditions: ['Defer', 'ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Discord Status')
			.setSubcommands([
				{
					label: '/discordstatus set <channel>',
					description: 'Set the channel to send notifications to'
				}, //
				{ label: '/discordstatus unset', description: 'Unset the current channel' },
				{ label: '/discordstatus settings', description: 'Show the current settings' }
			]);
	},
	subcommands: [
		{ name: 'set', chatInputRun: 'chatInputSet' },
		{ name: 'unset', chatInputRun: 'chatInputUnset' },
		{ name: 'settings', chatInputRun: 'chatInputSettings' }
	]
})
export class UtilityCommand extends KBotSubcommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
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

	public async chatInputSet(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { client, validator } = this.container;
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const settings = await this.module.settings.upsert(interaction.guildId, {
			incidentChannelId: channel.id
		});

		return await this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.upsert(interaction.guildId, {
			incidentChannelId: null
		});

		return await this.showSettings(interaction, settings);
	}

	public async chatInputSettings(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return await this.showSettings(interaction, settings);
	}

	private async showSettings(interaction: KBotSubcommand.ChatInputCommandInteraction, settings: UtilitySettings | null): Promise<unknown> {
		return await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Discord status settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`Channel: ${settings?.incidentChannelId ? channelMention(settings.incidentChannelId) : 'No channel set'}`)
			]
		});
	}
}
