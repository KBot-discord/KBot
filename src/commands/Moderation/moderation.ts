import { getGuildIds } from '#utils/config';
import { EmbedColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { ModerationModule } from '../../modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Moderation module config',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class ModerationCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('moderation')
					.setDescription('Show the current moderation module configuration')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('config')
							.setDescription('Show the current config')
					),
			{ idHints: ['1059975982452310047'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputInteraction) {
		return this.chatInputConfig(interaction);
	}

	public async chatInputConfig(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const [config, muteCount, lockedChannelCount] = await db.$transaction([
			db.moderationModule.findUnique({ where: { id: interaction.guildId! } }),
			db.mute.count({ where: { guildId: interaction.guildId! } }),
			db.lockedChannel.count({ where: { guildId: interaction.guildId! } })
		]);

		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Moderation module config', iconURL: interaction.guild!.iconURL()! })
					.addFields([
						{ name: 'Module enabled', value: `${config?.moduleEnabled ?? false}` },
						{
							name: 'Moderation log channel',
							value: `${config?.logChannel ? channelMention(config.logChannel) : 'No channel set'}`,
							inline: true
						},
						{
							name: 'Report channel',
							value: `${config?.reportChannel ? channelMention(config.reportChannel) : 'No channel set'}`,
							inline: true
						},
						{
							name: 'Mute role',
							value: `${config?.muteRole ? roleMention(config.muteRole) : 'No role set'}`,
							inline: true
						},
						{ name: '# of mutes', value: `${muteCount}`, inline: true },
						{ name: '# of locked channels', value: `${lockedChannelCount}`, inline: true }
					]),
				new MessageEmbed() //
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Minimum account age settings' })
					.addFields([
						{
							name: 'Account age requirement',
							value: config?.minAccountAgeReq ? `${config.minAccountAgeReq} day(s)` : 'No requirement set'
						},
						{
							name: 'Kick message',
							value:
								config?.minAccountAgeMsg ??
								'Hello! You have been automatically kicked from [server] because your account age is less then [req] day(s) old. Please join again in [days] or on [date]. Thank you!'
						}
					])
			]
		});
	}
}
