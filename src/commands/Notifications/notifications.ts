import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { NotificationModule } from '#modules/NotificationModule';
import type { NotificationSettings } from '#prisma';

@ApplyOptions<ModuleCommand.Options>({
	module: 'NotificationModule',
	description: 'Edit the settings of the notifications module.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class NotificationsCommand extends ModuleCommand<NotificationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('notifications')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable the notification module')
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
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'toggle': {
				return this.chatInputToggle(interaction);
			}
			default: {
				return this.chatInputSettings(interaction);
			}
		}
	}

	public async chatInputToggle(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { guildId } = interaction;

		const value = interaction.options.getBoolean('value', true);

		let settings: NotificationSettings;
		try {
			settings = await this.module.upsertSettings(guildId, {
				enabled: value
			});

			await Promise.all([
				this.module.twitter.toggleGuild(guildId, settings.enabled), //
				this.module.youtube.toggleGuild(guildId, settings.enabled)
			]);
		} catch (err: unknown) {
			this.container.logger.error(err);
			return interaction.errorReply("KBot's notification module is down at the moment.");
		}

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Notification module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? Emoji.GreenCheck : Emoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Notification module settings', iconURL: getGuildIcon(interaction.guild) })
					.addFields([{ name: 'Module enabled', value: `${settings?.enabled ? `true ${Emoji.GreenCheck}` : `false ${Emoji.RedX}`}` }])
			]
		});
	}
}
