import { EmbedColors } from '#utils/constants';
import { KBotCommand } from '#extensions/KBotCommand';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/framework';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommand.Options>({
	description: 'Info on how to change command permissions and the defaults that are set on the bot',
	helpEmbed: (builder) => {
		return builder //
			.setName('Permissions')
			.setDescription('Info on how to change command permissions and the defaults that are set on the bot.');
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.core);
	}

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default) //
					.setDescription(
						[
							'To edit command permissions go to `Server Settings -> Integrations -> KBot -> Manage`', //
							'Info about default permissions can be found at: https://docs.kbot.ca/configuration/permissions'
						].join('\n')
					)
			]
		});
	}
}
