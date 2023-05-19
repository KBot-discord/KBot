import { EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { KBotErrors } from '#types/Enums';
import { UnknownCommandError } from '#structures/errors/UnknownCommandError';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { UtilitySettings } from '@kbotdev/database';
import type { UtilityModule } from '#modules/UtilityModule';

@ApplyOptions<KBotCommand.Options>({
	description: 'Edit the settings of the utility module.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Utility')
			.setDescription('Edit the settings of the utility module.')
			.setSubcommands([
				{ label: '/utility toggle <value>', description: 'Enable or disable the utility module' }, //
				{ label: '/utility settings', description: 'Show the current settings' }
			]);
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.utility);
	}

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('utility')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable the utility module')
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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'toggle': {
				return this.chatInputToggle(interaction);
			}
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
				return interaction.client.emit(KBotErrors.UnknownCommand, {
					interaction,
					error: new UnknownCommandError()
				});
			}
		}
	}

	public async chatInputToggle(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			enabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Utility module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? KBotEmoji.GreenCheck : KBotEmoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSet(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const creditsChannel = interaction.options.getChannel('emote_credits');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			creditsChannelId: creditsChannel?.id
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const creditsChannel = interaction.options.getBoolean('emote_credits');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			creditsChannelId: creditsChannel ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputSettings(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private async showSettings(interaction: KBotCommand.ChatInputCommandInteraction, settings: UtilitySettings | null): Promise<unknown> {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Utility module settings', iconURL: getGuildIcon(interaction.guild) })
					.addFields([
						{
							name: 'Module enabled',
							value: `${settings?.enabled ? `true ${KBotEmoji.GreenCheck}` : `false ${KBotEmoji.RedX}`}`
						},
						{
							name: 'Discord status channel',
							value: `${settings?.incidentChannelId ? channelMention(settings.incidentChannelId) : 'No channel set'}`,
							inline: true
						},
						{
							name: 'Emote credits channel',
							value: `${settings?.creditsChannelId ? channelMention(settings.creditsChannelId) : 'No channel set'}`,
							inline: true
						}
					])
			]
		});
	}
}
