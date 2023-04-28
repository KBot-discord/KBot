import { EmbedColors } from '#utils/constants';
import { CreditCustomIds, CreditFields, buildCustomId, parseCustomId, CreditType } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { KBotErrors } from '#types/Enums';
import { getResourceFromType } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { messageLink } from '@discordjs/builders';
import { isNullish } from '@sapphire/utilities';
import type { Credit, CreditModal } from '#types/CustomIds';
import type { GuildTextBasedChannel } from 'discord.js';
import type { APIEmbedField } from 'discord-api-types/v10';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction<'cached'>,
		{ channelId, resource, type, source, description, artist }: InteractionHandler.ParseResult<this>
	) {
		const fields: APIEmbedField[] = [];
		if (source) fields.push({ name: 'Image source', value: source });
		if (description) fields.push({ name: 'Description', value: description });
		if (artist) fields.push({ name: 'Artist', value: artist });

		try {
			const creditsChannel = (await modal.guild.channels.fetch(channelId)) as GuildTextBasedChannel | null;
			if (isNullish(creditsChannel)) {
				return modal.errorReply("The current credits channel doesn't exist. Please set a new one with `/credits set`");
			}

			const { result, error } = await this.container.validator.channels.canSendEmbeds(creditsChannel);
			if (!result) {
				return modal.client.emit(KBotErrors.ChannelPermissions, { interaction: modal, error });
			}

			const message = await creditsChannel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Default)
						.setTitle(resource.name!)
						.setThumbnail(resource.url)
						.addFields(fields)
						.setFooter({ text: `${type === CreditType.Emote ? 'Emote' : 'Sticker'} ID: ${resource.id}` })
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder()
							.setCustomId(buildCustomId<Credit>(CreditCustomIds.ResourceEdit, { ri: resource.id!, t: type }))
							.setLabel('Edit info')
							.setStyle(ButtonStyle.Secondary),
						new ButtonBuilder()
							.setCustomId(buildCustomId<Credit>(CreditCustomIds.ResourceRefresh, { ri: resource.id!, t: type }))
							.setLabel('Refresh name')
							.setStyle(ButtonStyle.Secondary)
					])
				]
			});
			return modal.defaultReply(`[Credits sent](${messageLink(message.channelId, message.id)})`);
		} catch (err) {
			this.container.logger.error(err);
			return modal.errorReply('There was an error when trying to create the credit.');
		}
	}

	@validCustomId(CreditCustomIds.ResourceModalCreate)
	public override async parse(modal: ModalSubmitInteraction<'cached'>) {
		const settings = await this.container.utility.getSettings(modal.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await modal.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		await modal.deferReply({ ephemeral: true });

		const {
			data: { c, ri, t }
		} = parseCustomId<CreditModal>(modal.customId);

		const resource = getResourceFromType(modal.guildId, ri, t);
		if (!resource) {
			await modal.defaultFollowup(`That ${t === CreditType.Emote ? 'emote' : 'sticker'} has been deleted.`, true);
			return this.none();
		}

		const source = modal.fields.getTextInputValue(CreditFields.Source);
		const description = modal.fields.getTextInputValue(CreditFields.Description);
		const artist = modal.fields.getTextInputValue(CreditFields.Artist);

		return this.some({ channelId: c, resource, type: t, source, description, artist });
	}
}