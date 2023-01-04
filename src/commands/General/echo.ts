import { KBotErrors } from '#utils/constants';
import { getGuildIds } from '#utils/config';
import { Command, type ChatInputCommand } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Sends the provided message to the selected channel.',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class GeneralCommand extends Command {
	public constructor(context: ChatInputCommand.Context, options: ChatInputCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('echo')
					.setDescription(this.description)
					.addStringOption((option) =>
						option //
							.setName('message')
							.setDescription('Message you want to send')
							.setRequired(true)
					)
					.addChannelOption((option) =>
						option //
							.setName('channel')
							.setDescription('Select a channel to send the message in')
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
							.setRequired(true)
					),
			{
				idHints: ['1035943944569225368', '1036013816951099402'],
				guildIds: getGuildIds()
			}
		);
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		await interaction.deferReply();
		const { client, validator } = this.container;

		const message = interaction.options.getString('message', true);
		const channel: any = interaction.options.getChannel('channel', true);

		const { result, error } = validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emitError(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const sentMessage = await channel.send({
			content: message,
			allowedMentions: { parse: ['users'] }
		});

		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor('#33B54E')
					.setAuthor({ name: 'Message sent' })
					.setDescription(`**Channel:** <#${channel.id}>\n**Message:**\n\`\`\`${sentMessage.content}\`\`\``)
			]
		});
	}
}
