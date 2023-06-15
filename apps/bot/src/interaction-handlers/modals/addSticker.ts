import { CreditCustomIds, CreditType, ResourceCustomIds, ResourceFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { EmbedColors } from '#utils/constants';
import { buildCustomId, calculateStickerSlots, parseCustomId } from '#utils/discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import type { AddResourceModal, Credit, StickerData } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	name: ResourceCustomIds.Sticker,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(interaction: ModalSubmitInteraction<'cached'>, { stickerData }: InteractionHandler.ParseResult<this>): Promise<void> {
		const embed = new EmbedBuilder();
		const { url } = stickerData;

		const stickerName = interaction.fields.getTextInputValue(ResourceFields.Name);
		const newSticker = await interaction.guild.stickers.create({
			file: url,
			name: stickerName,
			tags: stickerName
		});

		if (url.startsWith('https')) {
			embed.setThumbnail(url);
		}

		const { slotsLeft, totalSlots } = calculateStickerSlots(interaction.guild);

		await interaction.editReply({
			embeds: [
				embed
					.setColor(EmbedColors.Success) //
					.setDescription(`**${stickerName}** has been added\n\n**Sticker slots left:** ${slotsLeft - 1}/${totalSlots}`)
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

	@validCustomId(ResourceCustomIds.Sticker)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const {
			data: { mi, ui }
		} = parseCustomId<AddResourceModal>(interaction.customId);

		const stickerData = await this.container.utility.getAndDeleteResourceCache<StickerData>(mi, ui);
		if (!stickerData) {
			await interaction.errorReply('Please try to add that sticker again.');
			return this.none();
		}

		await interaction.deferReply();

		return this.some({ stickerData });
	}
}
