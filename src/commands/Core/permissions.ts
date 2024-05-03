import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';
import type { CoreModule } from '../../modules/CoreModule.js';

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
		return await interaction.defaultReply(this.permissionInfo);
	}
}
