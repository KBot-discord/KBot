import { EmbedColors, EmojiRegex, UrlRegex } from '#utils/constants';
import { CreditCustomIds, CreditType, ResourceCustomIds, ResourceFields } from '#utils/customIds';
import { attachmentFromMessage, getGuildEmoteSlots } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { buildCustomId, fetchBase64Image, isNullOrUndefined } from '#utils/functions';
import { KBotModules } from '#types/Enums';
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import type { Credit } from '#types/CustomIds';
import type { Guild, Message, ModalSubmitInteraction } from 'discord.js';
import type { UtilityModule } from '#modules/UtilityModule';
import type { InteractionResponseUnion } from '#types/Augments';

type EmojiData = {
	url: string;
	animated: boolean;
};

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Utility,
	description: 'Adds the image attachment, link, or emoji that is in the message as an emoji. Priority is `emoji > attachment > link`.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageGuildExpressions],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Add Emote')
			.setTarget('message');
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('Add emote')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async contextMenuRun(interaction: KBotCommand.ContextMenuCommandInteraction): Promise<unknown> {
		const message = interaction.options.getMessage('message', true);

		const emoji = await this.getEmoji(message);
		if (isNullOrUndefined(emoji)) {
			return interaction.errorReply(
				'There is no emoji or file to add.\n\nSupported file types: `jpeg`/`jpg`, `png`, `gif`\nSupported file size: less than 256KB',
				{ tryEphemeral: true }
			);
		}

		const { staticSlots, animatedSlots, totalSlots } = this.calculateSlots(interaction.guild);

		if (emoji.animated && animatedSlots === 0) {
			return interaction.errorReply('No animated emoji slots are left.', {
				tryEphemeral: true
			});
		}

		if (!emoji.animated && staticSlots === 0) {
			return interaction.errorReply('No static emoji slots are left.', {
				tryEphemeral: true
			});
		}

		const slotsLeft = emoji.animated
			? `**Animated emote slots left:** ${animatedSlots - 1}/${totalSlots}`
			: `**Static emote slots left:** ${staticSlots - 1}/${totalSlots}`;

		try {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(ResourceCustomIds.Name)
					.setTitle('Emote name')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(ResourceFields.Name)
								.setLabel('Emote name')
								.setStyle(TextInputStyle.Short)
								.setMinLength(2)
								.setMaxLength(32)
								.setRequired(true)
						)
					)
			);

			return interaction //
				.awaitModalSubmit({
					filter: (i: ModalSubmitInteraction) => i.customId === ResourceCustomIds.Name,
					time: Time.Minute * 14.5
				})
				.then(async (modalInteraction) => this.handleSubmit(modalInteraction, emoji, slotsLeft))
				.catch(async () =>
					interaction.errorReply('The modal has timed out.', {
						tryEphemeral: true
					})
				);
		} catch {
			return interaction.errorReply('There was an error when trying to add the emoji.', {
				tryEphemeral: true
			});
		}
	}

	/**
	 * Handle the submission of the emote name modal
	 * @param modal - The modal interaction
	 * @param emojiData - The emoji data
	 * @param slotsLeft - Info about the guild's emoji slots
	 */
	private async handleSubmit(modal: ModalSubmitInteraction<'cached'>, emojiData: EmojiData, slotsLeft: string): Promise<InteractionResponseUnion> {
		const embed = new EmbedBuilder();
		const { url } = emojiData;

		const emoteName = modal.fields.getTextInputValue(ResourceFields.Name);
		if (!/^\w+$/.test(emoteName)) {
			return modal.errorReply('That is not a valid emote name.', {
				tryEphemeral: true
			});
		}

		const newEmoji = await modal.guild.emojis.create({ attachment: url, name: emoteName });

		if (url.startsWith('https')) {
			embed.setThumbnail(url);
		}

		return modal.reply({
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

	/**
	 * Calcuate how many emoji slots are left in the guild.
	 * @param guild - The guild
	 */
	private calculateSlots(guild: Guild): { staticSlots: number; animatedSlots: number; totalSlots: number } {
		const allEmojis = guild.emojis.cache;
		const totalSlots = getGuildEmoteSlots(guild.premiumTier);
		const animatedEmojiCount = allEmojis.filter((e) => Boolean(e.animated)).size;

		return {
			staticSlots: totalSlots - (allEmojis.size - animatedEmojiCount),
			animatedSlots: totalSlots - animatedEmojiCount,
			totalSlots
		};
	}

	/**
	 * Parse any emoji data in the targetted message.
	 * @param message - The message
	 *
	 * @remarks The priority for parsing is: emoji \> attachment \> links
	 */
	private async getEmoji(message: Message): Promise<EmojiData | null> {
		const emojiData = message.content.match(EmojiRegex);

		if (!isNullOrUndefined(emojiData)) {
			return {
				url: `https://cdn.discordapp.com/emojis/${emojiData[3]}.${emojiData[1] === 'a' ? 'gif' : 'png'}`,
				animated: emojiData[1] === 'a'
			};
		}

		if (message.attachments.size > 0) {
			const attachmentData = attachmentFromMessage(message);
			if (isNullOrUndefined(attachmentData)) return null;

			return {
				url: attachmentData.url,
				animated: attachmentData.fileType === '.gif'
			};
		}

		const fileUrl = message.content.match(UrlRegex);
		if (fileUrl) {
			const imageData = await fetchBase64Image(fileUrl[0]);
			if (isNullOrUndefined(imageData)) return null;

			return {
				url: imageData.url,
				animated: imageData.fileType === '.gif'
			};
		}

		return null;
	}
}
