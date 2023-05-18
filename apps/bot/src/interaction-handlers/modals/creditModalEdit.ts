import { EmbedColors } from '#utils/constants';
import { CreditCustomIds, CreditFields, parseCustomId, CreditType } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { getResourceFromType } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { CreditEditModal } from '#types/CustomIds';
import type { APIEmbedField } from 'discord-api-types/v10';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction<'cached'>,
		{ id, resource, type, source, description, artist }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		try {
			const message = await modal.channel!.messages.fetch(id);

			const fields: APIEmbedField[] = [];
			if (description) fields.push({ name: 'Description', value: description });
			if (artist) fields.push({ name: 'Artist', value: artist });
			if (source) fields.push({ name: 'Image source', value: source });

			await message.edit({
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColors.Default)
						.setTitle(resource.name!)
						.setThumbnail(message.embeds[0].thumbnail!.url)
						.addFields(fields)
						.setFooter({
							text: `${type === CreditType.Emote ? 'Emote' : 'Sticker'} ID: ${resource.id}`
						})
				]
			});
		} catch (err) {
			this.container.logger.error(err);
		}
	}

	@validCustomId(CreditCustomIds.ResourceModalEdit)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(modal: ModalSubmitInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(modal.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await modal.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		const {
			data: { mi, ri, t }
		} = parseCustomId<CreditEditModal>(modal.customId);

		const resource = getResourceFromType(modal.guildId, ri, t);
		if (!resource) {
			await modal.defaultFollowup(`That ${t === CreditType.Emote ? 'emote' : 'sticker'} has been deleted.`, true);
			return this.none();
		}

		await modal.deferUpdate();

		const source = modal.fields.getTextInputValue(CreditFields.Source);
		const description = modal.fields.getTextInputValue(CreditFields.Description);
		const artist = modal.fields.getTextInputValue(CreditFields.Artist);

		return this.some({ id: mi, resource, type: t, source, description, artist });
	}
}
