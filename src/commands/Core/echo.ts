import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ChannelType,
	EmbedBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
	roleMention,
} from 'discord.js';
import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import type { EchoModal } from '../../lib/types/CustomIds.js';
import { KBotErrors, KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { EchoCustomIds, EchoFields } from '../../lib/utilities/customIds.js';
import { buildCustomId } from '../../lib/utilities/discord.js';
import type { CoreModule } from '../../modules/CoreModule.js';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Core,
	description: 'Sends the provided text to the selected channel.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Echo')
			.setOption({ label: '/echo <text> <channel>' });
	},
	subcommands: [
		{ name: 'simple', chatInputRun: 'chatInputSimple' },
		{ name: 'detailed', chatInputRun: 'chatInputDetailed' },
	],
})
export class CoreCommand extends KBotSubcommand<CoreModule> {
	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
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
									.setRequired(true),
							)
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send the message to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true),
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping')
									.setRequired(false),
							),
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('detailed')
							.setDescription(
								'Open a text modal and then sends the submitted text. Useful if you need proper formatting',
							)
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send the message to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true),
							)
							.addRoleOption((option) =>
								option //
									.setName('role')
									.setDescription('The role to ping')
									.setRequired(false),
							),
					),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public async chatInputSimple(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const { client, validator } = this.container;

		const message = interaction.options.getString('text', true);
		const channel = interaction.options.getChannel('channel', true, [
			ChannelType.GuildText,
			ChannelType.GuildAnnouncement,
		]);
		const role = interaction.options.getRole('role');

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const sentMessage = await channel.send({
			content: role ? `${roleMention(role.id)} ${message}` : message,
			allowedMentions: { roles: role ? [role.id] : [] },
		});

		return await interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Success)
					.setDescription(`[Message sent](${sentMessage.url})`),
			],
		});
	}

	public async chatInputDetailed(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { client, validator } = this.container;

		const channel = interaction.options.getChannel('channel', true, [
			ChannelType.GuildText,
			ChannelType.GuildAnnouncement,
		]);
		const role = interaction.options.getRole('role') ?? undefined;

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const modal = this.buildModal(channel.id, role?.id);

		return await interaction.showModal(modal);
	}

	private buildModal(channelId: string, roleId?: string): ModalBuilder {
		return new ModalBuilder() //
			.setCustomId(
				buildCustomId<EchoModal>(EchoCustomIds.Detailed, {
					role: roleId,
					channel: channelId,
				}),
			)
			.setTitle('Echo')
			.setComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder() //
						.setCustomId(EchoFields.Text)
						.setLabel('The text you want sent')
						.setStyle(TextInputStyle.Paragraph),
				),
			);
	}
}
