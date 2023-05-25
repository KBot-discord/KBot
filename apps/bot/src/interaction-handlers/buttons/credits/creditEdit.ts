import { CreditCustomIds, CreditFields, CreditType } from '#utils/customIds';
import { interactionRatelimit, validCustomId } from '#utils/decorators';
import { buildCustomId, isNullOrUndefined, parseCustomId } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonInteraction } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Time } from '@sapphire/duration';
import type { Embed, Sticker, Emoji } from 'discord.js';
import type { Credit, CreditEditModal } from '#types/CustomIds';

type EmoteCreditEmbed = {
	source: string;
	description: string;
	artist: string;
};

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { resource, type }: InteractionHandler.ParseResult<this>): Promise<void> {
		const data = this.parseEmbedFields(interaction.message.embeds[0]);
		const modal = this.buildModal(interaction.message.id, resource.id!, type, data);

		return interaction.showModal(modal);
	}

	@validCustomId(CreditCustomIds.ResourceEdit)
	@interactionRatelimit(Time.Second * 30, 5)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) {
			return this.none();
		}

		if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
			await interaction.errorReply('You need the `Manage Emojis And Stickers` permission to use this.', true);
			return this.none();
		}

		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		const {
			data: { ri, t }
		} = parseCustomId<Credit>(interaction.customId);

		let resource: Emoji | Sticker;
		if (t === CreditType.Emote) {
			const emoji = interaction.guild.emojis.cache.get(ri);
			if (!emoji) {
				await interaction.defaultFollowup('That emote has been deleted.', true);
				return this.none();
			}

			resource = emoji;
		} else {
			const sticker = interaction.guild.stickers.cache.get(ri);
			if (!sticker) {
				await interaction.defaultFollowup('That sticker has been deleted.', true);
				return this.none();
			}

			resource = sticker;
		}

		return this.some({ resource, type: t });
	}

	private parseEmbedFields(embed: Embed): EmoteCreditEmbed {
		const { fields } = embed;
		return {
			description: fields.find((e) => e.name === 'Description')?.value ?? '',
			artist: fields.find((e) => e.name === 'Artist')?.value ?? '',
			source: fields.find((e) => e.name === 'Image source')?.value ?? ''
		};
	}

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
				),
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(CreditFields.Description)
						.setLabel('The description of the credit entry')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(0)
						.setMaxLength(100)
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
