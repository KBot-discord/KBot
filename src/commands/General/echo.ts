import { Command, type ChatInputCommand } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { KBotError } from '../../lib/structures/KBotError';
import { channelMention } from '@discordjs/builders';
import { KBotErrors } from '../../lib/util/constants';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Sends the provided message to the selected channel.',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class EchoCommand extends Command {
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

		const { valid, errors } = validator.channels.canSendEmbeds(channel);
		if (!valid) {
			const error = new KBotError({
				identifier: KBotErrors.ChannelPermissions,
				message: `I don't have the required permission(s) to send messages in ${channelMention(
					channel.id
				)}\n\nRequired permission(s):${errors}`
			});
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
