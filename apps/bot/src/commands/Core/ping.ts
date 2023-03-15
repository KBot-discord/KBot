import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommandOptions>({
	module: 'CoreModule',
	description: 'Ping the bot to see if it is alive.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages],
	helpEmbed: (builder) => {
		return builder //
			.setName('Ping')
			.setDescription('Ping the bot to see if it is alive.');
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
					.setName('ping')
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
		const message = await interaction.reply({ content: 'Ping?', fetchReply: true });
		if (!isMessageInstance(message)) {
			return interaction.editReply('Failed to retrieve ping :(');
		}

		const diff = message.createdTimestamp - interaction.createdTimestamp;
		const ping = Math.round(this.container.client.ws.ping);

		return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
	}
}
