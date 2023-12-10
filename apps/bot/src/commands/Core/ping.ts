import { KBotModules } from '#lib/types/Enums';
import { KBotCommand } from '#lib/extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'Ping the bot to see if it is alive.',
	helpEmbed: (builder) => {
		return builder //
			.setName('Ping');
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('ping')
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
		const message = await interaction.reply({ content: 'Ping?', fetchReply: true });

		const diff = message.createdTimestamp - interaction.createdTimestamp;
		const ping = Math.round(this.container.client.ws.ping);

		return interaction.editReply(`Pong! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
	}
}
