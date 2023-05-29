import { EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { KBotModules } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationSettings } from '@kbotdev/database';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Moderation,
	description: 'Prevent usernames that place the user to the top of the member list.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageNicknames],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Anti-Hoist')
			.setSubcommands([
				{ label: '/antihoist toggle <value>', description: 'Enable or disable anti-hoist' }, //
				{ label: '/antihoist settings', description: 'Show the current settings' }
			]);
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('antihoist')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable anti-hoist')
							.addBooleanOption((option) =>
								option //
									.setName('value')
									.setDescription('True: anti-hoist is enabled. False: anti-hoist is disabled.')
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
			case 'toggle':
				return this.chatInputToggle(interaction);
			case 'settings':
				return this.chatInputSettings(interaction);
			default:
				return this.unknownSubcommand(interaction);
		}
	}

	public async chatInputToggle(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			antiHoistEnabled: value
		});

		const description = settings.enabled //
			? `${KBotEmoji.GreenCheck} Anti-hoist is now enabled`
			: `${KBotEmoji.RedX} Anti-hoist is now disabled`;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Anti-Hoist settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(description)
			]
		});
	}

	public async chatInputSettings(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private async showSettings(interaction: KBotCommand.ChatInputCommandInteraction, settings: ModerationSettings | null): Promise<unknown> {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Anti-Hoist settings', iconURL: getGuildIcon(interaction.guild) })
					.addFields([
						{
							name: 'Enabled',
							value: `${settings?.antiHoistEnabled ? `true ${KBotEmoji.GreenCheck}` : `false ${KBotEmoji.RedX}`}`
						}
					])
			]
		});
	}
}
