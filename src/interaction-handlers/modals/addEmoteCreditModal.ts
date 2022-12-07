import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageActionRow, MessageButton, MessageEmbed, ModalSubmitInteraction, TextChannel } from 'discord.js';
import { EmbedColors } from '../../lib/util/constants';
import { AddEmoteCustomIds, AddEmoteFields } from '../../lib/types/enums';
import { buildKey, parseKey } from '../../lib/util/keys';
import { messageLink } from '@discordjs/builders';
import type { IEmoteCredit, IEmoteCreditModal, Key } from '../../lib/types/keys';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction,
		{ channelId, name, id, imageSource, description, artistName, artistLink }: InteractionHandler.ParseResult<this>
	) {
		const fields = [];
		if (description) fields.push({ name: 'Description', value: description });
		if (artistName) fields.push({ name: 'Artist', value: artistName, inline: true });
		if (artistLink) fields.push({ name: "Artist's profile", value: artistLink, inline: true });

		try {
			const creditsChannel = (await modal.guild!.channels.fetch(channelId)) as TextChannel;
			const message = await creditsChannel.send({
				embeds: [
					new MessageEmbed()
						.setColor(EmbedColors.Default)
						.setTitle(name)
						.setThumbnail(`https://cdn.discordapp.com/emojis/${id}`)
						.addFields([...fields, { name: 'Image source', value: imageSource }])
				],
				components: [
					new MessageActionRow().addComponents([
						new MessageButton()
							.setCustomId(buildKey<IEmoteCredit>(AddEmoteCustomIds.Edit, { name, id }))
							.setLabel('Edit info')
							.setStyle('SECONDARY')
					])
				]
			});
			return modal.defaultReply(`[Credits sent.](${messageLink(message.channelId, message.id)})`);
		} catch (err) {
			return this.container.logger.error(err);
		}
	}

	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.customId.startsWith(AddEmoteCustomIds.ModalCredits)) return this.none();
		await modal.deferReply({ ephemeral: true });

		const { channelId, name, id } = parseKey<IEmoteCreditModal>(modal.customId as Key);
		const imageSource = modal.fields.getTextInputValue(AddEmoteFields.CreditLink);
		const description = modal.fields.getTextInputValue(AddEmoteFields.CreditDescription);
		const artistName = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistName);
		const artistLink = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistLink);

		return this.some({ channelId, name, id, imageSource, description, artistName, artistLink });
	}
}
