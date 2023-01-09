import { getGuildIds } from '#utils/config';
import { EmbedColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { NotificationModule } from '../../modules/NotificationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'NotificationModule',
	description: 'Notification module config',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class ModerationCommand extends ModuleCommand<NotificationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('notifications')
					.setDescription('Show the current notification module configuration')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('config')
							.setDescription('Show the current config')
					),
			{ idHints: ['1059985549722648646'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		return this.chatInputConfig(interaction);
	}

	public async chatInputConfig(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const config = await db.notificationModule.findUnique({
			where: { id: interaction.guildId! },
			include: { twitter: true, twitch: true }
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Moderation module config', iconURL: interaction.guild!.iconURL()! })
					.addFields([
						{ name: 'Module enabled', value: `${config?.moduleEnabled ?? false}` },
						{ name: 'Twitter accounts followed', value: `${config?.twitter.length ?? false}` },
						{ name: 'Twitch accounts followed', value: `${config?.twitch.length ?? false}` }
					])
			]
		});
	}
}
