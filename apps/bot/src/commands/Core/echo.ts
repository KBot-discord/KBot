import { EmbedColors } from '#utils/constants';
import { KBotErrors, KBotModules } from '#types/Enums';
import { KBotCommand } from '#extensions/KBotCommand';
import { buildCustomId } from '#utils/functions';
import { EchoCustomIds, EchoFields } from '#utils/customIds';
import {
	ActionRowBuilder,
	ChannelType,
	EmbedBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	roleMention
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { CoreModule } from '#modules/CoreModule';
import type { EchoModal } from '#types/CustomIds';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'Sends the provided text to the selected channel.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Echo')
			.setOption({ label: '/echo <text> <channel>' });
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
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('simple')
							.setDescription('Sends the provided text')
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
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('detailed')
							.setDescription('Open a text modal and then sends the submitted text. Useful if you need proper formatting')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send the message to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true)
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping')
									.setRequired(false)
							)
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		switch (interaction.options.getSubcommand(true)) {
			case 'simple':
				return this.chatInputSimple(interaction);
			case 'detailed':
				return this.chatInputDetailed(interaction);
			default:
				return this.unknownSubcommand(interaction);
		}
	}

	public async chatInputSimple(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const { client, validator } = this.container;

		const message = interaction.options.getString('text', true);
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);
		const role = interaction.options.getRole('role');

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const sentMessage = await channel.send({
			content: role ? `${roleMention(role.id)} ${message}` : message,
			allowedMentions: { roles: role ? [role.id] : [] }
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setDescription(`[Message sent](${sentMessage.url})`)
			]
		});
	}

	public async chatInputDetailed(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { client, validator } = this.container;

		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);
		const role = interaction.options.getRole('role') ?? undefined;

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const modal = this.buildModal(channel.id, role?.id);

		return interaction.showModal(modal);
	}

	private buildModal(channelId: string, roleId?: string): ModalBuilder {
		return new ModalBuilder() //
			.setCustomId(
				buildCustomId<EchoModal>(EchoCustomIds.Detailed, {
					role: roleId,
					channel: channelId
				})
			)
			.setTitle('Echo')
			.setComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder() //
						.setCustomId(EchoFields.Text)
						.setLabel('The text you want sent')
						.setStyle(TextInputStyle.Paragraph)
				)
			);
	}
}
