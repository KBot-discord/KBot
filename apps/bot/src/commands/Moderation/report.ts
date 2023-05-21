import { getMemberAvatarUrl } from '#utils/discord';
import { EmbedColors, GENERIC_ERROR } from '#utils/constants';
import { ReportHandler, ReportButtons } from '#structures/handlers/ReportHandler';
import { KBotErrors } from '#types/Enums';
import { ReportCustomIds } from '#utils/customIds/report';
import { KBotCommand } from '#extensions/KBotCommand';
import { ApplicationCommandType, ButtonStyle, MessageType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { channelMention, userMention } from '@discordjs/builders';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { GuildMember, GuildTextBasedChannel, Message, MessageCreateOptions } from 'discord.js';
import type { APIEmbedField } from 'discord-api-types/v10';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommand.Options>({
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Report')
			.setDescription('Send the reported message to the set moderator channel.')
			.setTarget('message');
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.moderation);
	}

	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('Report')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async contextMenuRun(interaction: KBotCommand.ContextMenuCommandInteraction): Promise<unknown> {
		await interaction.deferReply({ ephemeral: true });

		const { validator, client } = this.container;
		const message = interaction.options.getMessage('message', true);

		const settings = await this.module.settings.get(interaction.guildId);
		if (isNullish(settings)) {
			this.container.logger.sentryMessage('Failed to fetch moderation settings', {
				context: { guildId: interaction.guildId }
			});
			return interaction.errorReply(GENERIC_ERROR);
		}

		if (isNullish(settings.reportChannelId)) {
			return interaction.defaultReply('No report channel is set. Please run `/moderation set report_channel`.');
		}

		const reportChannel = (await interaction.guild.channels.fetch(settings.reportChannelId)) as GuildTextBasedChannel | null;
		if (isNullish(reportChannel)) {
			return interaction.errorReply("The current report channel doesn't exist. Please set a new one with `/moderation set report_channel`.");
		}

		const { result, error } = await validator.channels.canSendEmbeds(reportChannel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const member = await interaction.guild.members.fetch(message.author.id);
		const messageData: MessageCreateOptions = {
			embeds: [this.buildEmbed(message, interaction.member, member)],
			components: [this.buildRow(message, member, interaction.guild.ownerId)]
		};

		let reportMessage: Message<true>;

		if (message.embeds.length > 0) {
			messageData.embeds!.push(message.embeds[0]);
		}

		if (message.attachments.size > 0) {
			const files = message.attachments.map((e) => {
				return new AttachmentBuilder(e.url, {
					name: e.name,
					description: e.description ?? undefined
				}).setSpoiler(true);
			});

			const fileFields: APIEmbedField[] = [];

			files.forEach((file) => {
				const name = {
					name: 'File name',
					value: file.name!.substring(8, file.name!.length),
					inline: true
				};
				fileFields.push(name);

				const desc = {
					name: 'File description',
					value: file.description ?? 'No file description',
					inline: true
				};
				fileFields.push(desc);
			});

			messageData.embeds!.push(
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.addFields(fileFields)
			);

			reportMessage = await reportChannel.send(messageData);

			await reportChannel.send({
				files
			});
		} else {
			reportMessage = await reportChannel.send(messageData);
		}

		new ReportHandler(message, reportMessage);

		return interaction.defaultReply(`[Report sent](${reportMessage.url})`);
	}

	private buildRow(message: Message, member: GuildMember, ownerId: string): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder() //
					.setCustomId(ReportCustomIds.Delete)
					.setLabel('Delete')
					.setStyle(ButtonStyle.Primary)
			)
			.addComponents(
				new ButtonBuilder() //
					.setCustomId(ReportCustomIds.Info)
					.setLabel('User Info')
					.setStyle(ButtonStyle.Primary)
			);

		if (message.webhookId) {
			row.components[ReportButtons.Delete].setDisabled(true);
			row.components[ReportButtons.Info].setDisabled(true);
		} else if (
			member.permissions.has(PermissionFlagsBits.Administrator) ||
			member.permissions.has(PermissionFlagsBits.BanMembers) ||
			member.id === ownerId ||
			message.type !== MessageType.Default
		) {
			row.components[ReportButtons.Delete].setDisabled(true);
		}

		return row;
	}

	private buildEmbed(message: Message, moderator: GuildMember, target: GuildMember): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: target.displayName, iconURL: getMemberAvatarUrl(target) })
			.setDescription(message.content === '' ? null : message.content)
			.setFields([
				{ name: 'Channel', value: channelMention(message.channelId), inline: true },
				{ name: 'Author', value: userMention(target.id), inline: true },
				{ name: 'Message link', value: `[Go to message](${message.url})`, inline: true }
			])
			.setFooter({ text: `Reported by ${moderator.user.tag}` })
			.setTimestamp();

		if (message.reference?.messageId) {
			embed.addFields({
				name: 'Reply to',
				value: `[Go to message](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.reference.messageId})`,
				inline: true
			});
		}

		return embed;
	}
}
