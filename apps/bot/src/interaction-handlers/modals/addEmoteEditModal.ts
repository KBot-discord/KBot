import { EmbedColors } from '#utils/constants';
import { AddEmoteCustomIds, AddEmoteFields, parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { ModalSubmitInteraction } from 'discord.js';
import type { EmoteEditModal } from '#types/CustomIds';
import type { APIEmbedField } from 'discord-api-types/v10';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction<'cached'>,
		{ id, emoji, emoteLink, description, artistName, artistLink }: InteractionHandler.ParseResult<this>
	) {
		try {
			const message = await modal.channel!.messages.fetch(id);

			const fields: APIEmbedField[] = [];
			if (description) fields.push({ name: 'Description', value: description });
			if (artistName) fields.push({ name: 'Artist', value: artistName, inline: true });
			if (artistLink) fields.push({ name: "Artist's profile", value: artistLink, inline: true });
			if (emoteLink) fields.push({ name: 'Image source', value: emoteLink });

			await message.edit({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Default)
						.setTitle(emoji.name!)
						.setThumbnail(message.embeds[0].thumbnail!.url)
						.addFields(fields)
						.setFooter({ text: `Emote ID: ${emoji.id}` })
				]
			});
		} catch (err) {
			return this.container.logger.error(err);
		}
	}

	public override async parse(modal: ModalSubmitInteraction<'cached'>) {
		if (!modal.customId.startsWith(AddEmoteCustomIds.ModalEdit)) return this.none();

		const settings = await this.container.utility.getSettings(modal.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await modal.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		const {
			data: { mi, ei }
		} = parseCustomId<EmoteEditModal>(modal.customId);

		const emoji = modal.guild.emojis.cache.get(ei);
		if (!emoji) {
			await modal.defaultReply('That emote has been deleted.', true);
			return this.none();
		}

		await modal.deferUpdate();

		const emoteLink = modal.fields.getTextInputValue(AddEmoteFields.CreditLink);
		const description = modal.fields.getTextInputValue(AddEmoteFields.CreditDescription);
		const artistName = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistName);
		const artistLink = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistLink);

		return this.some({ id: mi, emoji, emoteLink, description, artistName, artistLink });
	}
}
