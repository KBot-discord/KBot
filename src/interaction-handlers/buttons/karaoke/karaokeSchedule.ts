import { KaraokeCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction, MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { MenuInteractionHandler } from '@kbotdev/menus';
import { buildCustomId } from '@kbotdev/custom-id';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [KaraokeCustomIds.Schedule],
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction) {
		// TODO need voice, text, topic, role menus (new select menus are not available yet for Sapphire)
		return interaction.showModal(
			new Modal()
				.setCustomId(buildCustomId(KaraokeCustomIds.ModalSchedule, { message: interaction.message.id }))
				.setTitle('Create a karaoke event')
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeScheduleId')
							.setLabel('The id of the event')
							.setStyle('SHORT')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeScheduleVoice')
							.setLabel('The voice or stage channel for the event')
							.setStyle('SHORT')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeScheduleText')
							.setLabel('The text channel for the event')
							.setStyle('SHORT')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeScheduleRole')
							.setLabel('The role to ping for the event')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(32)
					)
				)
		);
	}
}
