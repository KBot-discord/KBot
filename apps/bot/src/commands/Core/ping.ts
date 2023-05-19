import { KBotCommand } from '#extensions/KBotCommand';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommand.Options>({
	description: 'Ping the bot to see if it is alive.',
	helpEmbed: (builder) => {
		return builder //
			.setName('Ping')
			.setDescription('Ping the bot to see if it is alive.');
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
		if (!isMessageInstance(message)) {
			return interaction.editReply('Failed to retrieve ping :(');
		}

		const diff = message.createdTimestamp - interaction.createdTimestamp;
		const ping = Math.round(this.container.client.ws.ping);

		return interaction.editReply(`Pong! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
	}
}
