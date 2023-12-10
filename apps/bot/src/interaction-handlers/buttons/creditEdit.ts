import { buildCustomId, parseCustomId } from '#lib/utilities/discord';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { interactionRatelimit, validCustomId } from '#lib/utilities/decorators';
import { CreditCustomIds, CreditFields, CreditType } from '#lib/utilities/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonInteraction, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Time } from '@sapphire/duration';
import type { Embed, Emoji, Sticker } from 'discord.js';
import type { Credit, CreditEditModal } from '#lib/types/CustomIds';

type EmoteCreditEmbed = {
	source: string;
	description: string;
	artist: string;
};

@ApplyOptions<InteractionHandler.Options>({
	name: CreditCustomIds.ResourceEdit,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { resource, type }: InteractionHandler.ParseResult<this>): Promise<void> {
		const data = this.parseEmbedFields(interaction.message.embeds[0]);
		const modal = this.buildModal(interaction.message.id, resource.id!, type, data);

		await interaction.showModal(modal);
	}

	@validCustomId(CreditCustomIds.ResourceEdit)
	@interactionRatelimit(Time.Second * 30, 5)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
			await interaction.errorReply('You need the `Manage Emojis And Stickers` permission to use this.', {
				tryEphemeral: true
			});
			return this.none();
		}

		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, {
				tryEphemeral: true
			});
			return this.none();
		}

		const {
			data: { ri, t }
		} = parseCustomId<Credit>(interaction.customId);

		let resource: Emoji | Sticker;
		if (t === CreditType.Emote) {
			const emoji = interaction.guild.emojis.cache.get(ri);
			if (!emoji) {
				await interaction.defaultFollowup('That emote has been deleted.', {
					ephemeral: true
				});
				return this.none();
			}

			resource = emoji;
		} else {
			const sticker = interaction.guild.stickers.cache.get(ri);
			if (!sticker) {
				await interaction.defaultFollowup('That sticker has been deleted.', {
					ephemeral: true
				});
				return this.none();
			}

			resource = sticker;
		}

		return this.some({ resource, type: t });
	}

	/**
	 * Get the credit info from an embed's fields.
	 * @param embed - The embed to parse
	 */
	private parseEmbedFields(embed: Embed): EmoteCreditEmbed {
		const { fields } = embed;
		return {
			description: fields.find((e) => e.name === 'Description')?.value ?? '',
			artist: fields.find((e) => e.name === 'Artist')?.value ?? '',
			source: fields.find((e) => e.name === 'Image source')?.value ?? ''
		};
	}

	/**
	 * Build a modal for editing a credit's info.
	 * @param messageId - The ID of the message
	 * @param resourceId - The ID of the resource
	 * @param type - The type of resource
	 * @param data - The credit info
	 */
	private buildModal(messageId: string, resourceId: string, type: CreditType, data: EmoteCreditEmbed): ModalBuilder {
		const { description, artist, source } = data;
		return new ModalBuilder()
			.setCustomId(
				buildCustomId<CreditEditModal>(CreditCustomIds.ResourceModalEdit, {
					mi: messageId,
					ri: resourceId,
					t: type
				})
			)
			.setTitle(`'Edit ${type === CreditType.Emote ? 'emote' : 'sticker'} credit info'`)
			.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Source)
						.setLabel('The source of the image')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
						.setValue(source)
						.setRequired(false)
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Description)
						.setLabel('The description of the credit entry')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
						.setValue(description)
						.setRequired(false)
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
						.setRequired(false)
				)
			);
	}
}
