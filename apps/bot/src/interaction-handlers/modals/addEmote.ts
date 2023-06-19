import { CreditCustomIds, CreditType, ResourceCustomIds, ResourceFields } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { EmbedColors } from '#utils/constants';
import { buildCustomId, calculateEmoteSlots, parseCustomId } from '#utils/discord';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import type { AddResourceModal, Credit, EmojiData } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	name: ResourceCustomIds.Emote,
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override async run(interaction: ModalSubmitInteraction<'cached'>, { emoteData }: InteractionHandler.ParseResult<this>): Promise<void> {
		const emoteName = interaction.fields.getTextInputValue(ResourceFields.Name);
		if (!/^\w+$/.test(emoteName)) {
			await interaction.errorReply('That is not a valid emote name.', {
				tryEphemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder();
		const { url, animated } = emoteData;

		const newEmoji = await interaction.guild.emojis
			.create({
				attachment: url,
				name: emoteName
			})
			.catch((e) => (e instanceof Error ? e : null));
		if (!newEmoji || newEmoji instanceof Error) {
			if (newEmoji instanceof DiscordAPIError && newEmoji.code === 50045) {
				await interaction.errorReply('The file size of that emoji is too big to upload.', {
					tryEphemeral: true
				});
			} else {
				await interaction.errorReply('Something went wrong when uploading the emoji.', {
					tryEphemeral: true
				});
			}

			return;
		}

		if (url.startsWith('https')) {
			embed.setThumbnail(url);
		}

		const { staticSlots, animatedSlots, totalSlots } = calculateEmoteSlots(interaction.guild);

		const slotsLeft = animated
			? `**Animated emote slots left:** ${animatedSlots}/${totalSlots}`
			: `**Static emote slots left:** ${staticSlots}/${totalSlots}`;

		await interaction.editReply({
			embeds: [
				embed
					.setColor(EmbedColors.Success) //
					.setDescription(`**${emoteName}** has been added\n\n${slotsLeft}`)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId(
							buildCustomId<Credit>(CreditCustomIds.Create, {
								ri: newEmoji.id,
								t: CreditType.Emote
							})
						)
						.setLabel('Add to credits channel')
						.setStyle(ButtonStyle.Success)
				])
			]
		});
	}

	@validCustomId(ResourceCustomIds.Emote)
	public override async parse(interaction: ModalSubmitInteraction<'cached'>) {
		const {
			data: { mi, ui }
		} = parseCustomId<AddResourceModal>(interaction.customId);

		const emoteData = await this.container.utility.getAndDeleteResourceCache<EmojiData>(mi, ui);
		if (!emoteData) {
			await interaction.errorReply('Please try to add that emote again.');
			return this.none();
		}

		await interaction.deferReply();

		return this.some({ emoteData });
	}
}
