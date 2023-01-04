import { EmbedColors, AddEmoteCustomIds, AddEmoteFields } from '#utils/constants';
import { getGuildIds } from '#utils/config';
import { getGuildEmoteSlots } from '#utils/util';
import axios from 'axios';
import { MessageActionRow, MessageEmbed, Modal, ModalSubmitInteraction, TextInputComponent, type Message, MessageButton } from 'discord.js';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { buildCustomId } from '@kbotdev/custom-id';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { EmoteCredit } from '#lib/types/CustomIds';
import type { UtilityModule } from '../../modules/UtilityModule';

interface EmojiData {
	emojiName?: string;
	emojiUrl: string;
	isAnimated: boolean;
}

@ApplyOptions<ModuleCommand.Options>({
	module: 'UtilityModule',
	name: 'Add emote',
	detailedDescription:
		'(Used on messages) Adds the image attachment, link, or emoji that is in the message. Priority is ``emoji > attachment > link``.',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class UtilityCommand extends ModuleCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
					.setName('Add emote')
					.setType(ApplicationCommandType.Message),
			{ idHints: ['1037024438350254200', '1036013815189491772'], guildIds: getGuildIds() }
		);
	}

	public async contextMenuRun(interaction: ModuleCommand.ContextMenuInteraction) {
		const embed = new MessageEmbed();
		const message = interaction.options.getMessage('message', true);

		const emoji = await this.getEmoji(message as Message);
		if (!emoji) {
			return interaction.followUp({
				embeds: [embed.setColor('RED').setDescription('There is no emoji')]
			});
		}

		const { staticSlots, animSlots, totalSlots } = await this.calculateSlots(interaction);
		const slotsLeft = emoji.isAnimated
			? `**Animated emote slots left:** ${animSlots - 1}/${totalSlots}`
			: `**Static emote slots left:** ${staticSlots - 1}/${totalSlots}`;

		if (emoji.isAnimated && staticSlots === 0) {
			return interaction.followUp({
				embeds: [embed.setColor('RED').setDescription('No animated emoji slots left.')]
			});
		}
		if (!emoji.isAnimated && animSlots === 0) {
			return interaction.followUp({
				embeds: [embed.setColor('RED').setDescription('No static emoji slots left.')]
			});
		}

		try {
			await interaction.showModal(
				new Modal()
					.setCustomId(AddEmoteCustomIds.Name)
					.setTitle('Emote name')
					.addComponents(
						new MessageActionRow<TextInputComponent>().addComponents(
							new TextInputComponent()
								.setCustomId(AddEmoteFields.Name)
								.setLabel('Emote name')
								.setStyle('SHORT')
								.setMinLength(1)
								.setMaxLength(32)
								.setRequired(true)
						)
					)
			);
			const filter = (i: ModalSubmitInteraction) => i.customId === AddEmoteCustomIds.Name;
			return interaction.awaitModalSubmit({ filter, time: 60_000 }).then(async (mdl) => this.handleSubmit(mdl, emoji, slotsLeft));
		} catch {
			return interaction.editReply({
				embeds: [embed.setColor('RED').setDescription('Failed to add emoji')]
			});
		}
	}

	private async handleSubmit(modal: ModalSubmitInteraction, emojiData: EmojiData, slotsLeft: string) {
		try {
			await modal.deferReply();
			const embed = new MessageEmbed();
			const { emojiUrl } = emojiData;

			const emoteName = modal.fields.getTextInputValue(AddEmoteFields.Name);
			const newEmoji = await modal.guild!.emojis.create(emojiUrl, emoteName);

			if (emojiUrl.startsWith('https')) {
				embed.setThumbnail(emojiUrl);
			}
			return modal.editReply({
				embeds: [embed.setColor(EmbedColors.Success).setDescription(`**${emoteName}** has been added\n\n${slotsLeft}`)],
				components: [
					new MessageActionRow().addComponents([
						new MessageButton()
							.setCustomId(
								buildCustomId<EmoteCredit>(AddEmoteCustomIds.Credits, {
									name: emoteName,
									id: newEmoji.id
								})
							)
							.setLabel('Add to credits channel')
							.setStyle('SUCCESS')
					])
				]
			});
		} catch {
			return modal.editReply({
				embeds: [new MessageEmbed().setColor('RED').setDescription('Failed to add emoji')]
			});
		}
	}

	private async calculateSlots(interaction: ModuleCommand.ContextMenuInteraction) {
		const allEmojis = await interaction.guild!.emojis.fetch();
		const totalSlots = getGuildEmoteSlots(interaction.guild!.premiumTier);
		return {
			staticSlots: totalSlots - allEmojis.filter((e) => !e.animated).size,
			animSlots: totalSlots - allEmojis.filter((e) => Boolean(e.animated)).size,
			totalSlots
		};
	}

	private async getEmoji(message: Message): Promise<EmojiData | null> {
		const emojiData = message.content.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
		const emojiEmbed = message.content.match(/https\S*?([a-zA-z0-9]+)(?:\.\w+)?(?:\s|$)/);

		// Priority: emoji -> attachment -> links
		if (emojiData) {
			return {
				emojiUrl: `https://cdn.discordapp.com/emojis/${emojiData[3]}.${emojiData[1] === 'a' ? 'gif' : 'png'}`,
				isAnimated: emojiData[1] === 'a'
			};
		}
		if (message.attachments.size > 0) {
			const attachmentUrl = message.attachments.at(0)!.url;
			const parsedUrl = attachmentUrl.match(/([a-zA-z0-9]+)(.png|.jpg|.gif)$/);
			if (!parsedUrl) return null;

			return {
				emojiUrl: attachmentUrl,
				isAnimated: parsedUrl[2] === '.gif'
			};
		}
		if (emojiEmbed) {
			const res = await axios.get(emojiEmbed[0], { responseType: 'arraybuffer' });
			if (!res || !res.headers['content-type']) return null;

			const resType = res.headers['content-type'].match(/\/\S*(png|jpg|gif)/);
			if (!resType) return null;

			const buffer = Buffer.from(res.data, 'binary').toString('base64');
			return {
				emojiUrl: `data:${res.headers['content-type']};base64,${buffer}`,
				isAnimated: resType[1] === '.gif'
			};
		}
		return null;
	}
}
