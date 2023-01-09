import { AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { buildCustomId, parseCustomId } from '@kbotdev/custom-id';
import type { ButtonInteraction } from 'discord.js';
import type { EmoteCredit, EmoteCreditModal } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [AddEmoteCustomIds.Credits];

	public override async run(interaction: ButtonInteraction, { name, id }: InteractionHandler.ParseResult<this>) {
		const channel = await this.container.db.utilityModule.findUnique({
			where: { id: interaction.guildId! },
			select: { creditsChannel: true }
		});

		if (isNullish(channel) || isNullish(channel.creditsChannel)) {
			return interaction.editReply('Theres no channel set up for credits');
		}
		return interaction.showModal(
			new ModalBuilder()
				// TODO need to make this custom id smaller
				.setCustomId(buildCustomId<EmoteCreditModal>(AddEmoteCustomIds.ModalCredits, { channelId: channel.creditsChannel, name, id }))
				.setTitle('Create a karaoke event')
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditLink)
							.setLabel('Source link')
							.setStyle(TextInputStyle.Short)
							.setMinLength(1)
							.setMaxLength(100)
							.setRequired(true)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditDescription)
							.setLabel('Description')
							.setStyle(TextInputStyle.Short)
							.setMinLength(0)
							.setMaxLength(100)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditArtistName)
							.setLabel('Artist name')
							.setStyle(TextInputStyle.Short)
							.setMinLength(0)
							.setMaxLength(100)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId(AddEmoteFields.CreditArtistLink)
							.setLabel('Artist link')
							.setStyle(TextInputStyle.Short)
							.setMinLength(0)
							.setMaxLength(100)
					)
				)
		);
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const {
			data: { name, id }
		} = parseCustomId<EmoteCredit>(interaction.customId);

		return this.some({ name, id });
	}
}
