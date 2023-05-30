import { KBotCommand } from '#extensions/KBotCommand';
import { KBotModules } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'Info on how to change command permissions and the defaults that are set on the bot.',
	helpEmbed: (builder) => {
		return builder //
			.setName('Permissions');
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	private readonly permissionInfo = [
		'To edit command permissions go to `Server Settings -> Integrations -> KBot -> Manage`', //
		'Info about default permissions can be found at: https://docs.kbot.ca/configuration/permissions'
	].join('\n');

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
		return interaction.defaultReply(this.permissionInfo);
	}
}
