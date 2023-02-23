import { EmbedColors } from '#utils/constants';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'CoreModule',
	description: 'Show information about command permissions.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class CoreCommand extends ModuleCommand<CoreModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('permissions')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(true),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder().setColor(EmbedColors.Default)
					.setDescription(`To edit command permissions go to \`Server Settings -> Integrations -> KBot -> Manage\`.

                    KBot's default permissions can be found here: https://docs.kbot.ca/permission-defaults`)
			]
		});
	}
}
