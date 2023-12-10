import { EmbedColors } from '#lib/utilities/constants';
import { CreditCustomIds, CreditFields, CreditType } from '#lib/utilities/customIds';
import { validCustomId } from '#lib/utilities/decorators';
import { getResourceFromType, parseCustomId } from '#lib/utilities/discord';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import type { APIEmbedField } from 'discord.js';
import type { CreditEditModal } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	name: CreditCustomIds.ResourceModalEdit,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(
		interaction: ModalSubmitInteraction<'cached'>,
		{ id, resource, type, source, description, artist }: InteractionHandler.ParseResult<this>
	): Promise<void> {
		const message = await interaction.channel!.messages.fetch(id);

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
	}

	@validCustomId(CreditCustomIds.ResourceModalEdit)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		const {
			data: { mi, ri, t }
		} = parseCustomId<CreditEditModal>(interaction.customId);

		const resource = getResourceFromType(interaction.guildId, ri, t);
		if (!resource) {
			await interaction.defaultFollowup(`That ${t === CreditType.Emote ? 'emote' : 'sticker'} has been deleted.`, {
				ephemeral: true
			});
			return this.none();
		}

		await interaction.deferUpdate();

		const source = interaction.fields.getTextInputValue(CreditFields.Source);
		const description = interaction.fields.getTextInputValue(CreditFields.Description);
		const artist = interaction.fields.getTextInputValue(CreditFields.Artist);

		return this.some({ id: mi, resource, type: t, source, description, artist });
	}
}
