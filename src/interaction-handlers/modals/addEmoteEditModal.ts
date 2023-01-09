import { EmbedColors, AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { parseCustomId } from '@kbotdev/custom-id';
import type { EmoteEditModal } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction,
		{ id, emoteName, emoteLink, description, artistName, artistLink }: InteractionHandler.ParseResult<this>
	) {
		try {
			const message = await modal.channel!.messages.fetch(id);

			const oldSource = message.embeds[0].fields!.find((e) => e.name === 'Image source');

			const fields = [];
			if (description) fields.push({ name: 'Description', value: description });
			if (artistName) fields.push({ name: 'Artist', value: artistName, inline: true });
			if (artistLink) fields.push({ name: "Artist's profile", value: artistLink, inline: true });
			fields.push({ name: 'Image source', value: emoteLink || oldSource!.value });

			await message.edit({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Default)
						.setTitle(emoteName ?? message.embeds[0].title)
						.setThumbnail(message.embeds[0].thumbnail!.url)
						.addFields(fields)
				]
			});
			if (emoteName) await modal.guild!.emojis.edit(message.embeds[0].thumbnail!.url.match(/(\d+)$/)![0], { name: emoteName });
			return modal.defaultReply('Edit successful.');
		} catch (err) {
			return this.container.logger.error(err);
		}
	}

	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.customId.startsWith(AddEmoteCustomIds.ModalEdit)) return this.none();
		await modal.deferReply({ ephemeral: true });

		const {
			data: { id }
		} = parseCustomId<EmoteEditModal>(modal.customId);

		const emoteName = modal.fields.getTextInputValue(AddEmoteFields.Name);
		const emoteLink = modal.fields.getTextInputValue(AddEmoteFields.CreditLink);
		const description = modal.fields.getTextInputValue(AddEmoteFields.CreditDescription);
		const artistName = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistName);
		const artistLink = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistLink);

		return this.some({ id, emoteName, emoteLink, description, artistName, artistLink });
	}
}
