import { AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { buildCustomId, parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { ButtonInteraction, Embed } from 'discord.js';
import type { EmoteCredit, EmoteEditModal } from '#types/CustomIds';

interface EmoteCreditEmbed {
	description: string;
	artistName: string;
	artistLink: string;
	source: string;
}

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [AddEmoteCustomIds.Edit];

	public override async run(interaction: ButtonInteraction<'cached'>, { emoteId }: InteractionHandler.ParseResult<this>) {
		const data = this.parseEmbedFields(interaction.message.embeds[0]);
		const emoji = await interaction.guild.emojis.fetch(emoteId);

		const modal = this.buildModal(interaction.message.id, emoji.id, data);

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
			data: { ei }
		} = parseCustomId<EmoteCredit>(interaction.customId);

		return this.some({ emoteId: ei });
	}

	private parseEmbedFields(embed: Embed): EmoteCreditEmbed {
		const { fields } = embed;
		return {
			description: fields.find((e) => e.name === 'Description')?.value ?? '',
			artistName: fields.find((e) => e.name === 'Artist')?.value ?? '',
			artistLink: fields.find((e) => e.name === "Artist's profile")?.value ?? '',
			source: fields.find((e) => e.name === 'Image source')?.value ?? ''
		};
	}

	private buildModal(messageId: string, emoteId: string, data: EmoteCreditEmbed): ModalBuilder {
		const { description, artistName, artistLink, source } = data;
		return new ModalBuilder()
			.setCustomId(
				buildCustomId<EmoteEditModal>(AddEmoteCustomIds.ModalEdit, {
					mi: messageId,
					ei: emoteId
				})
			)
			.setTitle('Edit emote credits info')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditDescription)
						.setLabel('Description')
						.setStyle(TextInputStyle.Short)
						.setMaxLength(100)
						.setRequired(false)
						.setValue(description)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditArtistName)
						.setLabel('Artist name')
						.setStyle(TextInputStyle.Short)
						.setMaxLength(100)
						.setRequired(false)
						.setValue(artistName)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditArtistLink)
						.setLabel('Artist link')
						.setStyle(TextInputStyle.Paragraph)
						.setMaxLength(250)
						.setRequired(false)
						.setValue(artistLink)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(AddEmoteFields.CreditLink)
						.setLabel('Image source')
						.setStyle(TextInputStyle.Paragraph)
						.setMaxLength(250)
						.setRequired(false)
						.setValue(source)
				)
			);
	}
}