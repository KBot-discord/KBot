// Imports
import axios from 'axios';
import { ChatInputCommand, Command, ContextMenuCommand } from '@sapphire/framework';
import { MessageActionRow, MessageEmbed, Modal, ModalSubmitInteraction, TextInputComponent, type Message } from 'discord.js';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildEmoteSlots } from '../../lib/util/constants';
import { getGuildIds, getIdHints } from '../../lib/util/config';

interface EmojiData {
	emojiName?: string;
	emojiUrl: string;
	isAnimated: boolean;
}

@ApplyOptions<ChatInputCommand.Options>({
	name: 'Add emote',
	detailedDescription:
		'(Used on messages) Adds the image attachment, link, or emoji that is in the message. Priority is ``emoji > attachment > link``.'
})
export class AddEmoteCommand extends Command {
	public constructor(context: ContextMenuCommand.Context, options: ContextMenuCommand.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
					.setName('Add emote')
					.setType(ApplicationCommandType.Message),
			{ idHints: getIdHints(this.name), guildIds: getGuildIds() }
		);
	}

	public async contextMenuRun(interaction: ContextMenuCommand.Interaction) {
		const embed = new MessageEmbed();
		const message = interaction.options.getMessage('message', true);

		const emojiData = await this.getEmojiData(message as Message);
		if (!emojiData) {
			return interaction.followUp({
				embeds: [embed.setColor('RED').setDescription('There is no emoji')]
			});
		}

		const { staticSlots, animSlots, totalSlots } = await this.calculateSlots(interaction);
		const slotsLeft = emojiData.isAnimated
			? `**Animated emote slots left:** ${animSlots - 1}/${totalSlots}`
			: `**Static emote slots left:** ${staticSlots - 1}/${totalSlots}`;

		if (emojiData.isAnimated && staticSlots === 0) {
			return interaction.followUp({
				embeds: [embed.setColor('RED').setDescription('No animated emoji slots left.')]
			});
		}
		if (!emojiData.isAnimated && animSlots === 0) {
			return interaction.followUp({
				embeds: [embed.setColor('RED').setDescription('No static emoji slots left.')]
			});
		}

		const modal = this.createModal();
		const filter = (i: ModalSubmitInteraction) => i.customId === 'addEmoteModal';

		try {
			await interaction.showModal(modal);
			return interaction.awaitModalSubmit({ filter, time: 60_000 }).then(async (mdl) => {
				emojiData.emojiName = mdl.fields.getTextInputValue('emoteNameInput');
				await this.handleSubmit(mdl, emojiData, embed, slotsLeft);
			});
		} catch {
			return interaction.editReply({
				embeds: [embed.setColor('RED').setDescription('Failed to add emoji')]
			});
		}
	}

	private async handleSubmit(modal: ModalSubmitInteraction, emoji: any, embed: MessageEmbed, slotsLeft: string) {
		try {
			await modal.deferReply();
			await modal.guild!.emojis.create(emoji.emojiUrl, emoji.emojiName);
			if (emoji.emojiUrl.startsWith('http')) {
				embed.setThumbnail(emoji.emojiUrl);
			}

			return modal.editReply({
				embeds: [embed.setColor('#33B54E').setDescription(`**${emoji.emojiName}** has been added\n\n${slotsLeft}`)]
			});
		} catch {
			return modal.editReply({
				embeds: [embed.setColor('RED').setDescription('Failed to add emoji')]
			});
		}
	}

	private createModal(): Modal {
		const modal = new Modal().setCustomId('addEmoteModal').setTitle('Emote name');

		const components = new MessageActionRow<TextInputComponent>().addComponents(
			new TextInputComponent()
				.setCustomId('emoteNameInput')
				.setLabel('Emote name')
				.setStyle('SHORT')
				.setMinLength(1)
				.setMaxLength(32)
				.setRequired(true)
		);

		modal.addComponents(components);
		return modal;
	}

	private async calculateSlots(interaction: ContextMenuCommand.Interaction) {
		const allEmojis = await interaction.guild!.emojis.fetch();
		const totalSlots = getGuildEmoteSlots(interaction.guild!.premiumTier);
		return {
			staticSlots: totalSlots - allEmojis.filter((e) => !e.animated).size,
			animSlots: totalSlots - allEmojis.filter((e) => Boolean(e.animated)).size,
			totalSlots
		};
	}

	private async getEmojiData(message: Message): Promise<EmojiData | null> {
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
