import { ApplyOptions } from '@sapphire/decorators';
import { InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import type { CoreModule } from '../../modules/CoreModule.js';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'Ping the bot to see if it is alive.',
})
export class CoreCommand extends KBotCommand<CoreModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName('ping')
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
				.setContexts([InteractionContextType.Guild, InteractionContextType.BotDM]),
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const message = await interaction.reply({ content: 'Ping?', withResponse: true });

		const diff = message.interaction.createdTimestamp - interaction.createdTimestamp;
		const ping = Math.round(this.container.client.ws.ping);

		return await interaction.editReply(`Pong! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
	}
}
