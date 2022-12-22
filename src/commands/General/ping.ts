import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { type ChatInputCommand, Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Ping bot to see if it is alive.',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages]
})
export class PingCommand extends Command {
	public constructor(context: ChatInputCommand.Context, options: ChatInputCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('ping')
					.setDescription(this.description),
			{ idHints: ['1035721679604809738', '1035810693787684895'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		const msg = await interaction.reply({ content: 'Ping?', fetchReply: true });
		if (isMessageInstance(msg)) {
			const diff = msg.createdTimestamp - interaction.createdTimestamp;
			const ping = Math.round(this.container.client.ws.ping);
			return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
		}
		return interaction.editReply('Failed to retrieve ping :(');
	}
}
