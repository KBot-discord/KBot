import { CreditCustomIds, CreditType, ResourceCustomIds, ResourceFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { EmbedColors } from '#utils/constants';
import { buildCustomId, calculateStickerSlots, parseCustomId } from '#utils/discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
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
		const newSticker = await interaction.guild.stickers
			.create({
				file: url,
				name: stickerName,
				tags: stickerName
			})
			.catch((e) => (e instanceof Error ? e : null));
		if (!newSticker || newSticker instanceof Error) {
			if (newSticker instanceof DiscordAPIError && newSticker.code === 50045) {
				await interaction.errorReply('The file size of that sticker is too big to upload.', {
					tryEphemeral: true
				});
			} else {
				await interaction.errorReply('Something went wrong when uploading the sticker.', {
					tryEphemeral: true
				});
			}

			return;
		}

		if (url.startsWith('https')) {
			embed.setThumbnail(url);
		}

		const { slotsLeft, totalSlots } = calculateStickerSlots(interaction.guild);

		await interaction.editReply({
			embeds: [
				embed
					.setColor(EmbedColors.Success) //
					.setDescription(`**${stickerName}** has been added\n\n**Sticker slots left:** ${slotsLeft}/${totalSlots}`)
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
