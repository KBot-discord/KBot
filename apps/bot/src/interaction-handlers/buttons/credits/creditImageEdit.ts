import { CreditCustomIds, CreditFields, buildCustomId } from '#utils/customIds';
import { interactionRatelimit, validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Time } from '@sapphire/duration';
import type { Embed } from 'discord.js';
import type { CreditImageEditModal } from '#types/CustomIds';

interface CreditEmbed {
	name: string;
	link: string;
	source: string;
	description: string;
	artist: string;
}

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>) {
		const data = this.parseEmbedFields(interaction.message.embeds[0]);

		const modal = this.buildModal(interaction.message.id, data);

		return interaction.showModal(modal);
	}

	@validCustomId(CreditCustomIds.ImageEdit)
	@interactionRatelimit(Time.Second * 30, 5)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
			await interaction.errorReply('You need the `Manage Emojis And Stickers` permission to use this.', true);
			return this.none();
		}

		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		return this.some();
	}

	private parseEmbedFields(embed: Embed): CreditEmbed {
		const { fields, title, image } = embed;
		return {
			name: title ?? '',
			link: image?.url ?? '',
			source: fields.find((e) => e.name === 'Image source')?.value ?? '',
			description: fields.find((e) => e.name === 'Description')?.value ?? '',
			artist: fields.find((e) => e.name === 'Artist')?.value ?? ''
		};
	}

	private buildModal(messageId: string, data: CreditEmbed): ModalBuilder {
		const { name, link, source, description, artist } = data;
		return new ModalBuilder()
			.setCustomId(
				buildCustomId<CreditImageEditModal>(CreditCustomIds.ImageModalEdit, {
					mi: messageId
				})
			)
			.setTitle('Edit image credit info')
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Name)
						.setLabel('The title of the credit entry')
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(50)
						.setRequired(true)
						.setValue(name)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Link)
						.setLabel('The link of the image')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
						.setRequired(true)
						.setValue(link)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Source)
						.setLabel('The source of the image')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
						.setRequired(true)
						.setValue(source)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Description)
						.setLabel('The description of the credit entry')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
						.setRequired(false)
						.setValue(description)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Artist)
						.setLabel('The artist')
						.setStyle(TextInputStyle.Short)
						.setMinLength(0)
						.setMaxLength(100)
						.setRequired(false)
						.setValue(artist)
				)
			);
	}
}