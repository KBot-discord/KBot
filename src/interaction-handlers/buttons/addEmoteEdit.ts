import { AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
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
			new Modal()
				.setCustomId(buildCustomId<EmoteEditModal>(AddEmoteCustomIds.ModalEdit, { id: interaction.message.id }))
				.setTitle('Edit emote credits info')
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.Name)
							.setLabel('Emote name (this will edit the emote too)')
							.setStyle('SHORT')
							.setMinLength(3)
							.setMaxLength(100)
							.setValue(oldName!)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditDescription)
							.setLabel('Description')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(100)
							.setValue(oldDesc?.value ?? '')
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditArtistName)
							.setLabel('Artist name')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(100)
							.setValue(oldArtName?.value ?? '')
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditArtistLink)
							.setLabel('Artist link')
							.setStyle('PARAGRAPH')
							.setMinLength(0)
							.setMaxLength(250)
							.setValue(oldArtLink?.value ?? '')
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditLink)
							.setLabel('Image source')
							.setStyle('PARAGRAPH')
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
