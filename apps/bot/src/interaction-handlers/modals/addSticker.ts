import { CreditCustomIds, CreditType, ResourceCustomIds, ResourceFields } from '#lib/utilities/customIds';
import { validCustomId } from '#lib/utilities/decorators';
import { EmbedColors } from '#lib/utilities/constants';
import { buildCustomId, calculateStickerSlots, parseCustomId } from '#lib/utilities/discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import type { AddResourceModal, Credit, StickerData } from '#lib/types/CustomIds';

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
			await this.handleError(interaction, newSticker);
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

	private async handleError(interaction: ModalSubmitInteraction<'cached'>, error: Error | null): Promise<void> {
		if (error instanceof DiscordAPIError) {
			// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
			switch (error.code) {
				case 50045: {
					await interaction.errorReply('The file size of that sticker is too big to upload. (Discord error code: 50045)', {
						tryEphemeral: true
					});
					return;
				}
				case 50138: {
					await interaction.errorReply('Discord was unable to resize the sticker when uploading. (Discord error code: 50138)', {
						tryEphemeral: true
					});
					return;
				}
			}
		}

		this.container.logger.sentryError(error);
		await interaction.errorReply('Something went wrong when uploading the sticker.', {
			tryEphemeral: true
		});
	}
}
