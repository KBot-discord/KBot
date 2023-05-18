import { EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { KBotCommand, type KBotCommandOptions } from '#extensions/KBotCommand';
import { KBotErrors } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { APIEmbedField } from 'discord-api-types/v10';
import type { ModerationSettings } from '@kbotdev/prisma';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommandOptions>({
	description: 'Edit the settings of the moderation module.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Moderation')
			.setDescription('Edit the settings of the moderation module.')
			.setSubcommands([
				{
					label: '/moderation toggle <value>',
					description: 'Enable or disable the moderation module'
				}, //
				{
					label: '/moderation set <report_channel>',
					description: 'Set new moderation module settings'
				},
				{
					label: '/moderation unset <report_channel>',
					description: 'Reset moderation module settings'
				},
				{
					label: '/moderation permissions',
					description: "Audit the bot's permissions for moderation features"
				},
				{ label: '/moderation settings', description: 'Show the current settings' }
			]);
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options }, container.moderation);
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('moderation')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set new moderation module settings')
							.addChannelOption((option) =>
								option //
									.setName('report_channel')
									.setDescription('The channel to send reports to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Reset moderation module settings')
							.addBooleanOption((option) =>
								option //
									.setName('report_channel')
									.setDescription('Unset the current report channel')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('permissions')
							.setDescription("Audit the bot's permissions for moderation features")
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable the moderation module')
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

	public override async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
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
			case 'permissions': {
				return this.chatInputPermissions(interaction);
			}
			case 'settings': {
				return this.chatInputSettings(interaction);
			}
			default: {
				return interaction.client.emit(KBotErrors.UnknownCommand, { interaction });
			}
		}
	}

	public async chatInputToggle(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			enabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({
						name: 'Moderation module settings',
						iconURL: getGuildIcon(interaction.guild)
					})
					.setDescription(`${settings.enabled ? KBotEmoji.GreenCheck : KBotEmoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const reportChannel = interaction.options.getChannel('report_channel');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			reportChannelId: reportChannel?.id
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const reportChannel = interaction.options.getBoolean('report_channel');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			reportChannelId: reportChannel ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputPermissions(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const { channels, members } = interaction.guild;

		const settings = await this.module.settings.get(interaction.guildId);

		const bot = await members.fetchMe();
		const fields: APIEmbedField[] = [];

		if (!isNullish(settings)) {
			if (!isNullish(settings.reportChannelId)) {
				const report = await channels.fetch(settings.reportChannelId);
				if (!isNullish(report)) {
					const reportViewChannel = bot.permissionsIn(report).has(PermissionFlagsBits.ViewChannel);
					const reportSendMessage = bot.permissionsIn(report).has(PermissionFlagsBits.SendMessages);
					const reportEmbedLinks = bot.permissionsIn(report).has(PermissionFlagsBits.EmbedLinks);

					const reportViewString = `View channel: ${this.formatField(reportViewChannel)}`;
					const reportSendString = `Send messages: ${this.formatField(reportSendMessage)}`;
					const reportEmbedString = `Embed links: ${this.formatField(reportEmbedLinks)}`;

					fields.push({
						name: 'Report channel',
						value: `${reportViewString}\n${reportSendString}\n${reportEmbedString}`,
						inline: true
					});
				}
			}
		}

		const kickPermissions = bot.permissions.has(PermissionFlagsBits.KickMembers);
		const antiHoistPermissions = bot.permissions.has(PermissionFlagsBits.ManageNicknames);

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({
						name: 'Moderation module permissions',
						iconURL: getGuildIcon(interaction.guild)
					})
					.addFields([
						{
							name: 'Minage',
							value: `Kick Members: ${this.formatField(kickPermissions)}`,
							inline: true
						},
						{
							name: 'Anti-hoist',
							value: `Manage Nicknames: ${this.formatField(antiHoistPermissions)}`,
							inline: true
						},
						...fields
					])
			]
		});
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private formatField(bool: boolean): string {
		return bool ? KBotEmoji.GreenCheck : KBotEmoji.RedX;
	}

	private async showSettings(
		interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>,
		settings: ModerationSettings | null
	): Promise<unknown> {
		const embed = new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'Moderation module settings', iconURL: getGuildIcon(interaction.guild) })
			.addFields([
				{
					name: 'Module enabled',
					value: `${settings?.enabled ? `true ${KBotEmoji.GreenCheck}` : `false ${KBotEmoji.RedX}`}`
				},
				{
					name: 'Anti-Hoist',
					value: `${settings?.antiHoistEnabled ? `true ${KBotEmoji.GreenCheck}` : `false ${KBotEmoji.RedX}`}`,
					inline: true
				},
				{
					name: 'Report channel',
					value: `${settings?.reportChannelId ? channelMention(settings.reportChannelId) : 'No channel set'}`,
					inline: true
				}
			]);

		return interaction.editReply({ embeds: [embed] });
	}
}
