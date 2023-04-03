import { EmbedColors } from '#utils/constants';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommandOptions>({
	module: 'CoreModule',
	description: 'Info on how to change command permissions and the defaults that are set on the bot',
	helpEmbed: (builder) => {
		return builder //
			.setName('Permissions')
			.setDescription('Info on how to change command permissions and the defaults that are set on the bot.');
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
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
				guildIds: []
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder().setColor(EmbedColors.Default)
					.setDescription(`To edit command permissions go to \`Server Settings -> Integrations -> KBot -> Manage\`

					Info about default permissions can be found at: https://docs.kbot.ca/configuration/permissions`)
			]
		});
	}
}
