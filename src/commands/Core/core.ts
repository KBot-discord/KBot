import { EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { roleMention } from '@discordjs/builders';
import type { CoreModule } from '#modules/CoreModule';
import type { CoreSettings } from '#prisma';

@ApplyOptions<ModuleCommand.Options>({
	module: 'CoreModule',
	description: 'Edit the settings of the core module.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class ModerationCommand extends ModuleCommand<CoreModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('core')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false)
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
			default: {
				return this.chatInputSettings(interaction);
			}
		}
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, settings: CoreSettings | null) {
		const staffRoles =
			settings && settings.staffRoles.length > 0 //
				? settings.staffRoles //
						.map((id) => ` ${roleMention(id)}`)
						.toString()
				: 'No roles set';

		const botManagers =
			settings && settings.botManagers.length > 0 //
				? settings.botManagers //
						.map((id) => ` ${roleMention(id)}`)
						.toString()
				: 'No roles set';

		const embed = new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'Core module settings', iconURL: getGuildIcon(interaction.guild) })
			.addFields([
				{ name: 'Staff roles', value: staffRoles, inline: true },
				{ name: 'Bot managers', value: botManagers, inline: true }
			]);

		return interaction.editReply({ embeds: [embed] });
	}
}
