import { UrlRegex } from '#lib/utilities/constants';
import { ResourceCustomIds, ResourceFields } from '#lib/utilities/customIds';
import { attachmentFromMessage, buildCustomId, calculateStickerSlots } from '#lib/utilities/discord';
import { fetchBase64Image, isNullOrUndefined } from '#lib/utilities/functions';
import { KBotModules } from '#lib/types/Enums';
import { KBotCommand } from '#lib/extensions/KBotCommand';
import { ActionRowBuilder, ApplicationCommandType, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { AddResourceModal, StickerData } from '#lib/types/CustomIds';
import type { Message } from 'discord.js';
import type { UtilityModule } from '#modules/UtilityModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Utility,
	description: 'Adds the image attachment, link, or sticker that is in the message as a sticker. Priority is `sticker > attachment > link`.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageGuildExpressions],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Add Sticker')
			.setTarget('message');
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('Add sticker')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async contextMenuRun(interaction: KBotCommand.ContextMenuCommandInteraction): Promise<unknown> {
		const message = interaction.options.getMessage('message', true);

		const sticker = await this.getSticker(message);
		if (isNullOrUndefined(sticker)) {
			return interaction.errorReply(
				'There is no sticker or file to add.\n\nSupported file types: `png` or `apng`\nSupported file size: less than 512KB',
				{ tryEphemeral: true }
			);
		}

		const { slotsLeft } = calculateStickerSlots(interaction.guild);
		if (slotsLeft === 0) {
			return interaction.errorReply('No stickers slots are left.', {
				tryEphemeral: true
			});
		}

		await this.container.utility.setResourceCache(message.id, interaction.user.id, sticker);

		return interaction.showModal(this.buildModal(message.id, interaction.user.id, sticker.name));
	}

	/**
	 * Parse any sticker data in the targetted message.
	 * @param message - The message
	 *
	 * @remarks The priority for parsing is: emoji \> attachment \> links
	 */
	private async getSticker(message: Message): Promise<StickerData | null> {
		const sticker = message.stickers.at(0);

		if (!isNullOrUndefined(sticker) && !isNullOrUndefined(sticker.url)) {
			return {
				url: sticker.url,
				name: sticker.name
			};
		}

		if (message.attachments.size > 0) {
			return attachmentFromMessage(message);
		}

		const fileUrl = message.content.match(UrlRegex);
		if (fileUrl) {
			return fetchBase64Image(fileUrl[0]);
		}

		return null;
	}

	private buildModal(messageId: string, userId: string, stickerName?: string): ModalBuilder {
		const textBuilder = new TextInputBuilder()
			.setCustomId(ResourceFields.Name)
			.setLabel('Sticker name')
			.setStyle(TextInputStyle.Short)
			.setMinLength(2)
			.setMaxLength(30)
			.setRequired(true);

		if (stickerName) textBuilder.setValue(stickerName);

		return new ModalBuilder() //
			.setCustomId(
				buildCustomId<AddResourceModal>(ResourceCustomIds.Sticker, {
					mi: messageId,
					ui: userId
				})
			)
			.setTitle('Sticker name')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>() //
					.addComponents(textBuilder)
			);
	}
}
