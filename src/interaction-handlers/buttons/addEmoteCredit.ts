import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { buildKey, parseKey } from '../../lib/util/keys';
import { AddEmoteCustomIds, AddEmoteFields } from '../../lib/types/enums';
import { isNullish } from '@sapphire/utilities';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import type { ButtonInteraction } from 'discord.js';
import type { IEmoteCredit, IEmoteCreditModal, Key } from '../../lib/types/keys';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { channel, name, id }: InteractionHandler.ParseResult<this>) {
		if (isNullish(channel)) {
			return interaction.editReply('Theres no channel set up for credits');
		}
		return interaction.showModal(
			new Modal()
				// TODO need to make this custom id smaller
				.setCustomId(buildKey<IEmoteCreditModal>(AddEmoteCustomIds.ModalCredits, { channelId: channel, name, id }))
				.setTitle('Create a karaoke event')
				.addComponents(
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditLink)
							.setLabel('Source link')
							.setStyle('SHORT')
							.setMinLength(1)
							.setMaxLength(100)
							.setRequired(true)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditDescription)
							.setLabel('Description')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(100)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditArtistName)
							.setLabel('Artist name')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(100)
					),
					new MessageActionRow<TextInputComponent>().addComponents(
						new TextInputComponent()
							.setCustomId(AddEmoteFields.CreditArtistLink)
							.setLabel('Artist link')
							.setStyle('SHORT')
							.setMinLength(0)
							.setMaxLength(100)
					)
				)
		);
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith(AddEmoteCustomIds.Credits)) return this.none();

		const { name, id } = parseKey<IEmoteCredit>(interaction.customId as Key);
		const channel = await this.container.db.utilityModule.findUnique({
			where: { id: interaction.guildId! },
			select: { creditsChannel: true }
		});

		return this.some({ channel: channel?.creditsChannel, name, id });
	}
}
