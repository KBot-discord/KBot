import { EmbedColors } from '#utils/constants';
import { KBotErrors, KBotModules } from '#types/Enums';
import { KBotCommand } from '#extensions/KBotCommand';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { CoreModule } from '#modules/CoreModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'Sends the provided text to the selected channel.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Echo')
			.setOptions({ label: '/echo <text> <channel>' });
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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
							.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildCategory)
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const { client, validator } = this.container;

		const message = interaction.options.getString('text', true);
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const sentMessage = await channel.send({
			content: message
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setDescription(`[Message sent](${sentMessage.url})`)
			]
		});
	}
}
