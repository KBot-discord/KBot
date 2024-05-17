import { ApplyOptions } from '@sapphire/decorators';
import { EmojiRegex } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import type { Message, MessageContextMenuCommandInteraction } from 'discord.js';
import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import type { AddResourceModal, EmojiData } from '../../lib/types/CustomIds.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { UrlRegex } from '../../lib/utilities/constants.js';
import { ResourceCustomIds, ResourceFields } from '../../lib/utilities/customIds.js';
import { attachmentFromMessage, buildCustomId, calculateEmoteSlots } from '../../lib/utilities/discord.js';
import { fetchBase64Image } from '../../lib/utilities/functions.js';
import type { UtilityModule } from '../../modules/UtilityModule.js';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Utility,
	description:
		'Adds the image attachment, link, or emoji that is in the message as an emoji. Priority is `emoji > attachment > link`.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageGuildExpressions],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Add Emote')
			.setTarget('message');
	},
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('Add emote')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction<'cached'>): Promise<unknown> {
		const message = interaction.options.getMessage('message', true);

		const emoji = await this.getEmoji(message);
		if (isNullOrUndefined(emoji)) {
			return await interaction.errorReply(
				'There is no emoji or file to add.\n\nSupported file types: `jpeg`/`jpg`, `png`, `gif`\nSupported file size: less than 256KB',
				{ tryEphemeral: true },
			);
		}

		const { staticSlots, animatedSlots } = calculateEmoteSlots(interaction.guild);
		if (emoji.animated && animatedSlots === 0) {
			return await interaction.errorReply('No animated emoji slots are left.', {
				tryEphemeral: true,
			});
		}
		if (!emoji.animated && staticSlots === 0) {
			return await interaction.errorReply('No static emoji slots are left.', {
				tryEphemeral: true,
			});
		}

		await this.container.utility.setResourceCache(message.id, interaction.user.id, emoji);

		return await interaction.showModal(this.buildModal(message.id, interaction.user.id, emoji.name));
	}

	/**
	 * Parse any emoji data in the targetted message.
	 * @param message - The message
	 *
	 * @remarks The priority for parsing is: emoji \> attachment \> links
	 */
	private async getEmoji(message: Message): Promise<EmojiData | null> {
		const emojiData = message.content.match(EmojiRegex);

		if (!isNullOrUndefined(emojiData)) {
			return {
				url: `https://cdn.discordapp.com/emojis/${emojiData[3]}.${emojiData[1] === 'a' ? 'gif' : 'png'}`,
				animated: emojiData.at(1) === 'a',
				name: emojiData.at(2),
			};
		}

		if (message.attachments.size > 0) {
			const attachmentData = attachmentFromMessage(message);
			if (isNullOrUndefined(attachmentData)) return null;

			return {
				url: attachmentData.url,
				animated: attachmentData.fileType === '.gif',
			};
		}

		const fileUrl = message.content.match(UrlRegex);
		if (fileUrl) {
			const imageData = await fetchBase64Image(fileUrl[0]);
			if (isNullOrUndefined(imageData)) return null;

			return {
				url: imageData.url,
				animated: imageData.fileType === 'gif',
			};
		}

		return null;
	}

	private buildModal(messageId: string, userId: string, emojiName?: string): ModalBuilder {
		const textBuilder = new TextInputBuilder()
			.setCustomId(ResourceFields.Name)
			.setLabel('Emote name')
			.setStyle(TextInputStyle.Short)
			.setMinLength(2)
			.setMaxLength(32)
			.setRequired(true);

		if (emojiName) textBuilder.setValue(emojiName);

		return new ModalBuilder() //
			.setCustomId(
				buildCustomId<AddResourceModal>(ResourceCustomIds.Emote, {
					mi: messageId,
					ui: userId,
				}),
			)
			.setTitle('Emote name')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>() //
					.addComponents(textBuilder),
			);
	}
}
