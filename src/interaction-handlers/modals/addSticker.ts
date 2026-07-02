import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { DiscordAPIError, EmbedBuilder, type ModalSubmitInteraction } from 'discord.js';
import type { AddResourceModal, StickerData } from '../../lib/types/CustomIds.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { ResourceCustomIds, ResourceFields } from '../../lib/utilities/customIds.js';
import { validCustomId } from '../../lib/utilities/decorators.js';
import { calculateStickerSlots, parseCustomId } from '../../lib/utilities/discord.js';

@ApplyOptions<InteractionHandler.Options>({
	name: ResourceCustomIds.Sticker,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ stickerData }: InteractionHandler.ParseResult<this>,
	): Promise<void> {
		const embed = new EmbedBuilder();
		const { url } = stickerData;

		const stickerName = interaction.fields.getTextInputValue(ResourceFields.Name);
		const newSticker = await interaction.guild.stickers
			.create({
				file: url,
				name: stickerName,
				tags: stickerName,
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
					.setDescription(`**${stickerName}** has been added\n\n**Sticker slots left:** ${slotsLeft}/${totalSlots}`),
			],
		});
	}

	@validCustomId(ResourceCustomIds.Sticker)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const {
			data: { mi, ui },
		} = parseCustomId<AddResourceModal>(interaction.customId);

		const stickerData = this.container.utility.getAndDeleteResourceCache<StickerData>(mi, ui);
		if (!stickerData) {
			await interaction.errorReply('Please try to add that sticker again.');
			return this.none();
		}

		await interaction.deferReply();

		return this.some({ stickerData });
	}

	private async handleError(interaction: ModalSubmitInteraction<'cached'>, error: Error | null): Promise<void> {
		if (error instanceof DiscordAPIError) {
			switch (error.code) {
				case 50045: {
					await interaction.errorReply(
						'The file size of that sticker is too big to upload. (Discord error code: 50045)',
						{
							tryEphemeral: true,
						},
					);
					return;
				}
				case 50138: {
					await interaction.errorReply(
						'Discord was unable to resize the sticker when uploading. (Discord error code: 50138)',
						{
							tryEphemeral: true,
						},
					);
					return;
				}
			}
		}

		this.container.logger.error(error);
		await interaction.errorReply('Something went wrong when uploading the sticker.', {
			tryEphemeral: true,
		});
	}
}
