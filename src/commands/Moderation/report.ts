import { channelMention, userMention } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageType,
	PermissionFlagsBits,
} from 'discord.js';
import type {
	APIActionRowComponent,
	APIEmbed,
	APIEmbedField,
	APIMessageActionRowComponent,
	GuildMember,
	GuildTextBasedChannel,
	JSONEncodable,
	Message,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { ReportButtons, ReportHandler } from '../../lib/structures/handlers/ReportHandler.js';
import { KBotErrors, KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { ReportCustomIds } from '../../lib/utilities/customIds.js';
import { fetchChannel, getMemberAvatarUrl } from '../../lib/utilities/discord.js';
import type { ModerationModule } from '../../modules/ModerationModule.js';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Moderation,
	description: 'Send the reported message to the set moderator channel.',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Report')
			.setTarget('message');
	},
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
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
				guildIds: [],
			},
		);
	}

	public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction<'cached'>): Promise<unknown> {
		await interaction.deferReply({ ephemeral: true });

		const { validator, client } = this.container;
		const message = interaction.options.getMessage('message', true);

		const settings = await this.module.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || isNullOrUndefined(settings.reportChannelId)) {
			return await interaction.defaultReply('No report channel is set. Please run `/moderation set report_channel`.');
		}

		const reportChannel = await fetchChannel<GuildTextBasedChannel>(settings.reportChannelId);
		if (isNullOrUndefined(reportChannel)) {
			return await interaction.errorReply(
				"The current report channel doesn't exist. Please set a new one with `/moderation set report_channel`.",
			);
		}

		const { result, error } = await validator.channels.canSendEmbeds(reportChannel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const member = await interaction.guild.members.fetch(message.author.id);
		const embeds: JSONEncodable<APIEmbed>[] = [
			this.buildEmbed(message, interaction.member, member), //
		];
		const components: JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>[] = [
			this.buildRow(message, member, interaction.guild.ownerId),
		];

		let reportMessage: Message<true>;

		if (message.embeds.length > 0) {
			embeds.push(message.embeds[0]);
		}

		if (message.attachments.size > 0) {
			const files = message.attachments.map((e) => {
				return new AttachmentBuilder(e.url, {
					name: e.name,
					description: e.description ?? undefined,
				}).setSpoiler(true);
			});

			const fileFields: APIEmbedField[] = [];

			for (const file of files) {
				const name = {
					name: 'File name',
					value: file.name!.substring(8, file.name!.length),
					inline: true,
				};
				fileFields.push(name);

				const desc = {
					name: 'File description',
					value: file.description ?? 'No file description',
					inline: true,
				};
				fileFields.push(desc);
			}

			embeds.push(
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.addFields(fileFields),
			);

			reportMessage = await reportChannel.send({
				embeds,
				components,
			});

			await reportChannel.send({
				files,
			});
		} else {
			reportMessage = await reportChannel.send({
				embeds,
				components,
			});
		}

		new ReportHandler(message, reportMessage);

		return await interaction.successReply(`[Report sent](${reportMessage.url})`);
	}

	/**
	 * Build the action row for the report message
	 * @param message - The reported message
	 * @param member - The author of the reported message
	 * @param ownerId - The ID of the guild's owner
	 */
	private buildRow(message: Message, member: GuildMember, ownerId: string): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder() //
					.setCustomId(ReportCustomIds.Delete)
					.setLabel('Delete')
					.setStyle(ButtonStyle.Primary),
			)
			.addComponents(
				new ButtonBuilder() //
					.setCustomId(ReportCustomIds.Info)
					.setLabel('User Info')
					.setStyle(ButtonStyle.Primary),
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

	/**
	 * Build the embed for the report message
	 * @param message - The reported message
	 * @param moderator - The user that reported the message
	 * @param target - The author of the reported message
	 */
	private buildEmbed(message: Message, moderator: GuildMember, target: GuildMember): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: target.displayName, iconURL: getMemberAvatarUrl(target) })
			.setDescription(message.content === '' ? null : message.content)
			.setFields([
				{ name: 'Channel', value: channelMention(message.channelId), inline: true },
				{ name: 'Author', value: userMention(target.id), inline: true },
				{ name: 'Message link', value: `[Go to message](${message.url})`, inline: true },
			])
			.setFooter({ text: `Reported by ${moderator.user.username}` })
			.setTimestamp();

		if (message.reference?.messageId) {
			embed.addFields({
				name: 'Reply to',
				value: `[Go to message](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.reference.messageId})`,
				inline: true,
			});
		}

		return embed;
	}
}
