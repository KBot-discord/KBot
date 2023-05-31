import { EmbedColors, KBotEmoji } from '#utils/constants';
import { fetchChannel, getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { isNullOrUndefined } from '#utils/functions';
import { KBotModules } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { APIEmbedField } from 'discord.js';
import type { ModerationSettings } from '@kbotdev/database';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Moderation,
	description: 'Edit the settings of the moderation module.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Moderation')
			.setSubcommands([
				{
					label: '/moderation toggle <value>',
					description: 'Enable or disable the moderation module'
				},
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
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'toggle':
				return this.chatInputToggle(interaction);
			case 'set':
				return this.chatInputSet(interaction);
			case 'unset':
				return this.chatInputUnset(interaction);
			case 'permissions':
				return this.chatInputPermissions(interaction);
			case 'settings':
				return this.chatInputSettings(interaction);
			default:
				return this.unknownSubcommand(interaction);
		}
	}

	public async chatInputToggle(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			enabled: value
		});

		const description = settings.enabled //
			? `${KBotEmoji.GreenCheck} module is now enabled`
			: `${KBotEmoji.RedX} module is now disabled`;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({
						name: 'Moderation module settings',
						iconURL: getGuildIcon(interaction.guild)
					})
					.setDescription(description)
			]
		});
	}

	public async chatInputSet(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const reportChannel = interaction.options.getChannel('report_channel', false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			reportChannelId: reportChannel?.id
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const reportChannel = interaction.options.getBoolean('report_channel');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			reportChannelId: reportChannel ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputPermissions(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { members } = interaction.guild;

		const settings = await this.module.settings.get(interaction.guildId);

		const bot = await members.fetchMe();
		const fields: APIEmbedField[] = [];

		if (!isNullOrUndefined(settings)) {
			if (!isNullOrUndefined(settings.reportChannelId)) {
				const report = await fetchChannel(settings.reportChannelId);
				if (!isNullOrUndefined(report)) {
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

	public async chatInputSettings(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private formatField(bool: boolean): string {
		return bool ? KBotEmoji.GreenCheck : KBotEmoji.RedX;
	}

	private async showSettings(interaction: KBotCommand.ChatInputCommandInteraction, settings: ModerationSettings | null): Promise<unknown> {
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
