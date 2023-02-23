import { AddEmoteCustomIds, AddEmoteFields, EmbedColors } from '#utils/constants';
import { buildCustomId, parseCustomId } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { messageLink } from '@discordjs/builders';
import { isNullish } from '@sapphire/utilities';
import type { ModalSubmitInteraction, GuildTextBasedChannel } from 'discord.js';
import type { EmoteCredit, EmoteCreditModal } from '#types/CustomIds';
import type { APIEmbedField } from 'discord-api-types/v10';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction<'cached'>,
		{ channelId, name, id, imageSource, description, artistName, artistLink }: InteractionHandler.ParseResult<this>
	) {
		const fields: APIEmbedField[] = [];
		if (description) fields.push({ name: 'Description', value: description });
		if (artistName) fields.push({ name: 'Artist', value: artistName, inline: true });
		if (artistLink) fields.push({ name: "Artist's profile", value: artistLink, inline: true });

		try {
			const creditsChannel = (await modal.guild.channels.fetch(channelId)) as GuildTextBasedChannel | null;
			if (isNullish(creditsChannel)) {
				return modal.errorReply("The current credits channel doesn't exist. Please set a new one with `/addemote set`");
			}

			const message = await creditsChannel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Default)
						.setTitle(name)
						.setThumbnail(`https://cdn.discordapp.com/emojis/${id}`)
						.addFields([...fields, { name: 'Image source', value: imageSource }])
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder()
							.setCustomId(buildCustomId<EmoteCredit>(AddEmoteCustomIds.Edit, { name, id }))
							.setLabel('Edit info')
							.setStyle(ButtonStyle.Secondary)
					])
				]
			});
			return modal.defaultReply(`[Credits sent](${messageLink(message.channelId, message.id)})`);
		} catch (err) {
			this.container.logger.error(err);
			return modal.errorReply('There was an error when trying to create the emote credits.');
		}
	}

	public override async parse(modal: ModalSubmitInteraction<'cached'>) {
		if (!modal.customId.startsWith(AddEmoteCustomIds.ModalCredits)) return this.none();

		const settings = await this.container.utility.getSettings(modal.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await modal.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		await modal.deferReply({ ephemeral: true });

		const {
			data: { channelId, name, id }
		} = parseCustomId<EmoteCreditModal>(modal.customId);

		const imageSource = modal.fields.getTextInputValue(AddEmoteFields.CreditLink);
		const description = modal.fields.getTextInputValue(AddEmoteFields.CreditDescription);
		const artistName = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistName);
		const artistLink = modal.fields.getTextInputValue(AddEmoteFields.CreditArtistLink);

		return this.some({ channelId, name, id, imageSource, description, artistName, artistLink });
	}
}
