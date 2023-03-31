import { EmbedColors } from '#utils/constants';
import { KBotErrors } from '#types/Enums';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { EmbedBuilder } from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { channelMention } from '@discordjs/builders';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommandOptions>({
	module: 'CoreModule',
	description: 'Sends the provided text to the selected channel.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Echo')
			.setDescription('Sends the provided text to the selected channel.')
			.setOptions({ label: '/echo <text> <channel>' });
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
					.setName('echo')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addStringOption((option) =>
						option //
							.setName('text')
							.setDescription('The text of the message')
							.setRequired(true)
					)
					.addChannelOption((option) =>
						option //
							.setName('channel')
							.setDescription('The channel to send the message to')
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { client, validator } = this.container;

		const message = interaction.options.getString('text', true);
		const channel: any = interaction.options.getChannel('channel', true);

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const sentMessage = await channel.send({
			content: message,
			allowedMentions: { parse: ['users'] }
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Success)
					.setAuthor({
						name: `Message sent`
					})
					.setDescription(`**Channel:** ${channelMention(channel.id)}\n**Text:**\n\`\`\`${sentMessage.content}\`\`\``)
			]
		});
	}
}
