import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction, MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { KaraokeCustomIds } from '../../../lib/types/enums';
import { buildKey } from '../../../lib/util/keys';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction) {
		// TODO need voice, text, topic, role menus (new select menus are not available yet for Sapphire)
		return interaction.showModal(
			new Modal()
				.setCustomId(buildKey(KaraokeCustomIds.ModalCreate, { message: interaction.message.id }))
				.setTitle('Create a karaoke event')
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeCreateVoice')
							.setLabel('The voice or stage channel for the event')
							.setStyle('SHORT')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeCreateText')
							.setLabel('The text channel for the event')
							.setStyle('SHORT')
							.setMinLength(1)
							.setMaxLength(32)
							.setRequired(true)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeCreateTopic')
							.setLabel('The topic of the stage')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(32)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId('karaokeCreateRole')
							.setLabel('The role to ping for the event')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(32)
					)
				)
		);
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(KaraokeCustomIds.Create)) return this.none();
		return this.some();
	}
}