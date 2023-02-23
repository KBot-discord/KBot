import { AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { buildCustomId, parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { ButtonInteraction } from 'discord.js';
import type { EmoteCredit, EmoteCreditModal } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [AddEmoteCustomIds.Credits];

	public override async run(interaction: ButtonInteraction<'cached'>, { channelId, name, id }: InteractionHandler.ParseResult<this>) {
		if (isNullish(channelId)) {
			return interaction.defaultReply('There is no channel set up for credits.');
		}

		const modal = this.buildModal(channelId, name, id);
		return interaction.showModal(modal);
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
			await interaction.errorReply('You need the `Manage Emojis And Stickers` permission to use this.', true);
			return this.none();
		}

		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		const {
			data: { name, id }
		} = parseCustomId<EmoteCredit>(interaction.customId);

		return this.some({ channelId: settings.creditsChannelId, name, id });
	}

	private buildModal(channelId: string, name: string, id: string): ModalBuilder {
		// TODO check custom ID limit
		return new ModalBuilder()
			.setCustomId(buildCustomId<EmoteCreditModal>(AddEmoteCustomIds.ModalCredits, { channelId, name, id }))
			.setTitle('Add a credit for an emote')
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
						.setLabel("Artist's name")
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(100)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditArtistLink)
						.setLabel("Artist's profile")
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(100)
				)
			);
	}
}
