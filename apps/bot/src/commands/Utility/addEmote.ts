import { EmbedColors } from '#utils/constants';
import { AddEmoteCustomIds, AddEmoteFields, buildCustomId } from '#utils/customIds';
import { getGuildEmoteSlots } from '#utils/Discord';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { Message, ModalSubmitInteraction } from 'discord.js';
import type { EmoteCredit } from '#types/CustomIds';
import type { UtilityModule } from '#modules/UtilityModule';

interface EmojiData {
	url: string;
	animated: boolean;
}

@ApplyOptions<KBotCommandOptions>({
	module: 'UtilityModule',
	name: 'Add emote',
	detailedDescription:
		'(Used on messages) Adds the image attachment, link, or emoji that is in the message. Priority is `emoji > attachment > link`.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageEmojisAndStickers],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Add Emote')
			.setDescription('Adds the image attachment, link, or emoji that is in the message. Priority is `emoji > attachment > link`.')
			.setTarget('message');
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('Add emote')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public async contextMenuRun(interaction: ModuleCommand.ContextMenuCommandInteraction<'cached'>) {
		const message = interaction.options.getMessage('message', true);

		const emoji = await this.getEmoji(message);
		if (isNullish(emoji)) {
			return interaction.errorReply('There is no emoji or file to add.');
		}

		const { staticSlots, animatedSlots, totalSlots } = this.calculateSlots(interaction);

		if (emoji.animated && animatedSlots === 0) {
			return interaction.errorReply('No animated emoji slots are left.');
		}
		if (!emoji.animated && staticSlots === 0) {
			return interaction.errorReply('No static emoji slots are left.');
		}

		const slotsLeft = emoji.animated
			? `**Animated emote slots left:** ${animatedSlots - 1}/${totalSlots}`
			: `**Static emote slots left:** ${staticSlots - 1}/${totalSlots}`;

		try {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(AddEmoteCustomIds.Name)
					.setTitle('Emote name')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(AddEmoteFields.Name)
								.setLabel('Emote name')
								.setStyle(TextInputStyle.Short)
								.setMinLength(1)
								.setMaxLength(32)
								.setRequired(true)
						)
					)
			);

			return interaction //
				.awaitModalSubmit({
					filter: (i: ModalSubmitInteraction) => i.customId === AddEmoteCustomIds.Name,
					time: 60_000
				})
				.then(async (modalInteraction) => this.handleSubmit(modalInteraction, emoji, slotsLeft))
				.catch(() => interaction.errorReply('The modal has timed out.'));
		} catch {
			return interaction.errorReply('There was an error when trying to add the emoji.');
		}
	}

	private async handleSubmit(modal: ModalSubmitInteraction<'cached'>, emojiData: EmojiData, slotsLeft: string) {
		await modal.deferReply();
		const embed = new EmbedBuilder();
		const { url } = emojiData;

		const emoteName = modal.fields.getTextInputValue(AddEmoteFields.Name);
		const newEmoji = await modal.guild.emojis.create({ attachment: url, name: emoteName });

		if (url.startsWith('https')) {
			embed.setThumbnail(url);
		}

		return modal.editReply({
			embeds: [embed.setColor(EmbedColors.Success).setDescription(`**${emoteName}** has been added\n\n${slotsLeft}`)],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId(
							buildCustomId<EmoteCredit>(AddEmoteCustomIds.Credits, {
								ei: newEmoji.id
							})
						)
						.setLabel('Add to credits channel')
						.setStyle(ButtonStyle.Success)
				])
			]
		});
	}

	private calculateSlots(interaction: ModuleCommand.ContextMenuCommandInteraction<'cached'>) {
		const allEmojis = interaction.guild.emojis.cache;
		const totalSlots = getGuildEmoteSlots(interaction.guild.premiumTier);
		const animatedEmojiCount = allEmojis.filter((e) => Boolean(e.animated)).size;

		return {
			staticSlots: totalSlots - (allEmojis.size - animatedEmojiCount),
			animatedSlots: totalSlots - animatedEmojiCount,
			totalSlots
		};
	}

	private async getEmoji(message: Message): Promise<EmojiData | null> {
		const emojiData = message.content.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
		const emojiEmbed = message.content.match(/https\S*?([a-zA-Z0-9]+)(?:\.\w+)?(?:\s|$)/);

		// Priority: emoji -> attachment -> links
		if (!isNullish(emojiData)) {
			return {
				url: `https://cdn.discordapp.com/emojis/${emojiData[3]}.${emojiData[1] === 'a' ? 'gif' : 'png'}`,
				animated: emojiData[1] === 'a'
			};
		}

		if (message.attachments.size > 0) {
			const attachmentUrl = message.attachments.at(0)!.url;
			const parsedUrl = attachmentUrl.match(/([a-zA-Z0-9]+)(.png|.jpg|.gif)$/);
			if (isNullish(parsedUrl)) return null;

			return {
				url: attachmentUrl,
				animated: parsedUrl[2] === '.gif'
			};
		}

		if (emojiEmbed) {
			const response = await fetch(emojiEmbed[0], FetchResultTypes.Result);
			const contentType = response.headers.get('content-type');
			if (!response || !contentType) return null;

			const resType = contentType.match(/\/\S*(png|jpg|gif)/);
			if (!resType) return null;

			const buffer = Buffer.from(await response.arrayBuffer()).toString('base64');

			return {
				url: `data:${contentType};base64,${buffer}`,
				animated: resType[1] === '.gif'
			};
		}

		return null;
	}
}
