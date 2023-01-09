import { AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { buildCustomId } from '@kbotdev/custom-id';
import type { ButtonInteraction } from 'discord.js';
import type { EmoteEditModal } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [AddEmoteCustomIds.Edit];

	public override async run(interaction: ButtonInteraction) {
		const oldName = interaction.message!.embeds[0].title;
		const oldDesc = interaction.message!.embeds[0].fields!.find((e) => e.name === 'Description');
		const oldArtName = interaction.message!.embeds[0].fields!.find((e) => e.name === 'Artist');
		const oldArtLink = interaction.message!.embeds[0].fields!.find((e) => e.name === "Artist's link");
		const oldSource = interaction.message!.embeds[0].fields!.find((e) => e.name === 'Image source');

		return interaction.showModal(
			new ModalBuilder()
				.setCustomId(buildCustomId<EmoteEditModal>(AddEmoteCustomIds.ModalEdit, { id: interaction.message.id }))
				.setTitle('Edit emote credits info')
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.Name)
							.setLabel('Emote name (this will edit the emote too)')
							.setStyle(TextInputStyle.Short)
							.setMinLength(3)
							.setMaxLength(100)
							.setValue(oldName!)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditDescription)
							.setLabel('Description')
							.setStyle(TextInputStyle.Short)
							.setMinLength(0)
							.setMaxLength(100)
							.setValue(oldDesc?.value ?? '')
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditArtistName)
							.setLabel('Artist name')
							.setStyle(TextInputStyle.Short)
							.setMinLength(0)
							.setMaxLength(100)
							.setValue(oldArtName?.value ?? '')
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditArtistLink)
							.setLabel('Artist link')
							.setStyle(TextInputStyle.Paragraph)
							.setMinLength(0)
							.setMaxLength(250)
							.setValue(oldArtLink?.value ?? '')
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditLink)
							.setLabel('Image source')
							.setStyle(TextInputStyle.Paragraph)
							.setMinLength(0)
							.setMaxLength(250)
							.setValue(oldSource?.value ?? '')
					)
				)
		);
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();
		return this.some();
	}
}
