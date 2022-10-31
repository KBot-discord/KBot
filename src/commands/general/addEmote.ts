// Imports
import axios from 'axios';
import { Command, ContextMenuCommand } from '@sapphire/framework';
import {
    MessageActionRow,
    MessageEmbed,
    Modal,
    ModalSubmitInteraction,
    TextInputComponent
} from "discord.js";
import { TextInputStyles } from "discord.js/typings/enums";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { KBotCommand } from "../../lib/extensions/KBotCommand";
import { getGuildEmoteSlots } from "../../lib/util/constants";

// Types
import type { Message } from "discord.js";


async function getEmojiData(message: Message): Promise<{
    emojiName?: string;
    emojiUrl: string, isAnimated: boolean } | null> {
    const emojiData = message.content.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
    const emojiEmbed = message.content.match(/https\S*?([a-zA-z0-9]+)(?:\.\w+)?(?:\s|$)/);

    // Priority: emoji -> attachment -> links
    if (emojiData) {
        return {
            emojiUrl: `https://cdn.discordapp.com/emojis/${emojiData[3]}.${emojiData[1] === 'a' ? 'gif' : 'png'}`,
            isAnimated: emojiData[1] === 'a'
        }
    } else if (message.attachments.size > 0) {
        const attachmentUrl = message.attachments.at(0)!.url
        const parsedUrl = attachmentUrl.match(/([a-zA-z0-9]+)(.png|.jpg|.gif)$/);
        if (!parsedUrl) return null

        return {
            emojiUrl: attachmentUrl,
            isAnimated: parsedUrl[2] === '.gif'
        }
    } else if (emojiEmbed) {
        const res = await axios.get(emojiEmbed[0], { responseType: 'arraybuffer' });
        if (!res || !res.headers['content-type']) return null;

        const resType = res.headers['content-type'].match(/\/\S*(png|jpg|gif)/);
        if (!resType) return null;

        const buffer = Buffer.from(res.data, 'binary').toString('base64');
        return {
            emojiUrl: `data:${res.headers['content-type']};base64,${buffer}`,
            isAnimated: resType[1] === '.gif'
        }
    }
    return null;
}

export class AddEmote extends KBotCommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
        registry.registerContextMenuCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
                    .setName('Add emote')
                    .setType(3),
            {
                idHints: super.getIdHints(this.constructor.name),
                guildIds: super.getGuildIds(),
            }
        );
    }

    public async contextMenuRun(interaction: Command.ContextMenuInteraction) {
        const embed = new MessageEmbed();
        const message = interaction.options.getMessage('message', true);

        const emojiData = await getEmojiData(message as Message);
        if (!emojiData) {
            return interaction.followUp({
                embeds: [embed.setColor('RED').setDescription('There is no emoji')],
            });
        }

        const allEmoji = await interaction.guild!.emojis.fetch();
        const totalSlots = getGuildEmoteSlots(interaction.guild!.premiumTier);
        const staticAvail = totalSlots - allEmoji.filter(e => !e.animated).size;
        const animAvail = totalSlots - allEmoji.filter(e => !!e.animated).size;

        const slotsLeft = emojiData.isAnimated
            ? `**Animated emote slots left:** ${animAvail - 1}/${totalSlots}`
            : `**Static emote slots left:** ${staticAvail - 1}/${totalSlots}`;

        if (emojiData.isAnimated && animAvail === 0) {
            return interaction.followUp({
                embeds: [embed.setColor('RED').setDescription('No animated emoji slots left.')],
            });
        } else if (!emojiData.isAnimated && staticAvail === 0) {
            return interaction.followUp({
                embeds: [embed.setColor('RED').setDescription('No static emoji slots left.')],
            });
        }

        const modal = new Modal()
            .setCustomId('addEmoteModal')
            .setTitle('Emote name');

        modal.addComponents(
            new MessageActionRow<TextInputComponent>()
                .addComponents(new TextInputComponent()
                    .setCustomId('emoteNameInput')
                    .setLabel("Emote name")
                    .setStyle(TextInputStyles.SHORT)
                    .setMinLength(1)
                    .setMaxLength(32)
                    .setRequired(true))
        );
        const filter = (interaction: ModalSubmitInteraction) => interaction.customId === 'addEmoteModal';

        try {
            await interaction.showModal(modal);

            interaction.awaitModalSubmit({filter, time: 60_000})
                .then(async (modal) => {
                    emojiData.emojiName = modal.fields.getTextInputValue('emoteNameInput');
                    await this.handleSubmit(modal, emojiData, embed, slotsLeft)
                }).catch(err => console.error(err))
        } catch {
            return interaction.editReply({
                embeds: [embed.setColor('RED').setDescription('Failed to add emoji')],
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
                embeds: [embed
                    .setColor('#33B54E')
                    .setDescription(`**${emoji.emojiName}** has been added\n\n${slotsLeft}`)],
            });
        } catch {
            return modal.editReply({
                embeds: [embed.setColor('RED').setDescription('Failed to add emoji')],
            });

        }
    }
}