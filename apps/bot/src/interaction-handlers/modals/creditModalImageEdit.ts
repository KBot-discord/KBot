import { EmbedColors } from '#utils/constants';
import { CreditCustomIds, CreditFields, parseCustomId } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { CreditImageEditModal } from '#types/CustomIds';
import type { APIEmbedField } from 'discord-api-types/v10';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		modal: ModalSubmitInteraction<'cached'>,
		{ id, name, link, source, description, artist }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		try {
			const message = await modal.channel!.messages.fetch(id);

			const fields: APIEmbedField[] = [];
			if (description) fields.push({ name: 'Description', value: description });
			if (artist) fields.push({ name: 'Artist', value: artist });
			if (source) fields.push({ name: 'Image source', value: source });

			await message.edit({
				embeds: [
					new EmbedBuilder() //
						.setColor(EmbedColors.Default)
						.setTitle(name)
						.setImage(link)
						.addFields(fields)
				]
			});
		} catch (err) {
			this.container.logger.error(err);
		}
	}

	@validCustomId(CreditCustomIds.ImageModalEdit)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(modal: ModalSubmitInteraction) {
		if (!modal.inCachedGuild()) {
			return this.none();
		}

		const settings = await this.container.utility.settings.get(modal.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await modal.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		const {
			data: { mi }
		} = parseCustomId<CreditImageEditModal>(modal.customId);

		await modal.deferUpdate();

		const name = modal.fields.getTextInputValue(CreditFields.Name);
		const link = modal.fields.getTextInputValue(CreditFields.Link);
		const source = modal.fields.getTextInputValue(CreditFields.Source);
		const description = modal.fields.getTextInputValue(CreditFields.Description);
		const artist = modal.fields.getTextInputValue(CreditFields.Artist);

		return this.some({ id: mi, name, link, source, description, artist });
	}
}
