import { EmbedColors, UrlRegex } from '#utils/constants';
import { CreditCustomIds, CreditType, ResourceCustomIds, ResourceFields } from '#utils/customIds';
import { attachmentFromMessage, getGuildStickerSlots } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { buildCustomId, fetchBase64Image, isNullOrUndefined } from '#utils/functions';
import { KBotModules } from '#types/Enums';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import type { Credit } from '#types/CustomIds';
import type { Guild, Message, ModalSubmitInteraction } from 'discord.js';
import type { UtilityModule } from '#modules/UtilityModule';
import type { InteractionResponseUnion } from '#types/Augments';

type StickerData = {
	url: string;
	name?: string;
};

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

		const { slotsLeft, totalSlots } = this.calculateSlots(interaction.guild);

		if (slotsLeft === 0) {
			return interaction.errorReply('No stickers slots are left.', {
				tryEphemeral: true
			});
		}

		const slotsLeftString = `**Sticker slots left:** ${slotsLeft - 1}/${totalSlots}`;

		try {
			await interaction.showModal(this.buildModal(sticker.name));

			return interaction //
				.awaitModalSubmit({
					filter: (i: ModalSubmitInteraction) => i.customId === ResourceCustomIds.Name,
					time: Time.Minute * 14.5
				})
				.then(async (modalInteraction) => this.handleSubmit(modalInteraction, sticker, slotsLeftString))
				.catch(async () =>
					interaction.errorReply('The modal has timed out.', {
						tryEphemeral: true
					})
				);
		} catch {
			return interaction.errorReply('There was an error when trying to add the emoji.', {
				tryEphemeral: true
			});
		}
	}

	/**
	 * Handle the submission of the sticker name modal
	 * @param modal - The modal interaction
	 * @param emojiData - The sticker data
	 * @param slotsLeft - Info about the guild's sticker slots
	 */
	private async handleSubmit(
		modal: ModalSubmitInteraction<'cached'>,
		emojiData: StickerData,
		slotsLeftString: string
	): Promise<InteractionResponseUnion> {
		const embed = new EmbedBuilder();
		const { url } = emojiData;

		const stickerName = modal.fields.getTextInputValue(ResourceFields.Name);
		const newSticker = await modal.guild.stickers.create({
			file: url,
			name: stickerName,
			tags: stickerName
		});

		if (url.startsWith('https')) {
			embed.setThumbnail(url);
		}

		return modal.reply({
			embeds: [
				embed
					.setColor(EmbedColors.Success) //
					.setDescription(`**${stickerName}** has been added\n\n${slotsLeftString}`)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId(
							buildCustomId<Credit>(CreditCustomIds.Create, {
								ri: newSticker.id,
								t: CreditType.Sticker
							})
						)
						.setLabel('Add to credits channel')
						.setStyle(ButtonStyle.Success)
				])
			]
		});
	}

	/**
	 * Calcuate how many emoji slots are left in the guild.
	 * @param guild - The guild
	 */
	private calculateSlots(guild: Guild): { slotsLeft: number; totalSlots: number } {
		const allStickers = guild.stickers.cache;
		const totalSlots = getGuildStickerSlots(guild.premiumTier);

		return {
			slotsLeft: totalSlots - allStickers.size,
			totalSlots
		};
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

	private buildModal(stickerName?: string): ModalBuilder {
		const textBuilder = new TextInputBuilder()
			.setCustomId(ResourceFields.Name)
			.setLabel('Sticker name')
			.setStyle(TextInputStyle.Short)
			.setMinLength(2)
			.setMaxLength(30)
			.setRequired(true);

		if (stickerName) textBuilder.setValue(stickerName);

		return new ModalBuilder() //
			.setCustomId(ResourceCustomIds.Name)
			.setTitle('Sticker name')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>() //
					.addComponents(textBuilder)
			);
	}
}
