import { EmbedColors } from '#lib/utilities/constants';
import { CreditCustomIds, CreditFields } from '#lib/utilities/customIds';
import { validCustomId } from '#lib/utilities/decorators';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { parseCustomId } from '#lib/utilities/discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import type { APIEmbedField } from 'discord.js';
import type { CreditImageEditModal } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	name: CreditCustomIds.ImageModalEdit,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ id, name, link, source, description, artist }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const message = await interaction.channel!.messages.fetch(id);

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
	}

	@validCustomId(CreditCustomIds.ImageModalEdit)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		const {
			data: { mi }
		} = parseCustomId<CreditImageEditModal>(interaction.customId);

		await interaction.deferUpdate();

		const name = interaction.fields.getTextInputValue(CreditFields.Name);
		const link = interaction.fields.getTextInputValue(CreditFields.Link);
		const source = interaction.fields.getTextInputValue(CreditFields.Source);
		const description = interaction.fields.getTextInputValue(CreditFields.Description);
		const artist = interaction.fields.getTextInputValue(CreditFields.Artist);

		return this.some({ id: mi, name, link, source, description, artist });
	}
}
