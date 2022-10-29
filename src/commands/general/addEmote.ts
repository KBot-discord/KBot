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
import { getIdHint } from "../../lib/util/configuration";
import { TextInputStyles } from "discord.js/typings/enums";
import { PermissionFlagsBits } from "discord-api-types/v10";

// Types
import type { Message } from "discord.js";


const slot = { 'NONE': 50, 'TIER_1': 100, 'TIER_2': 150, 'TIER_3': 250 };

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
        if (!res) return null;

        // @ts-ignore
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

export class AddEmote extends Command {
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
                idHints: [getIdHint(this.constructor.name)],
                guildIds: ['953375922990506005'],
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
        const staticEmoji = allEmoji.filter(e => !e.animated).size;
        const animEmoji = allEmoji.filter(e => !!e.animated).size;
        const staticAvail = slot[interaction.guild!.premiumTier] - staticEmoji;
        const animAvail = slot[interaction.guild!.premiumTier] - animEmoji;

        const slotsLeft = emojiData.isAnimated ?
            `**Animated emote slots left:** ${animAvail - 1}/${slot[interaction.guild!.premiumTier]}` :
            `**Static emote slots left:** ${staticAvail - 1}/${slot[interaction.guild!.premiumTier]}`;

        if (emojiData.isAnimated && animAvail === 0) {
            return interaction.followUp({
                embeds: [embed.setColor('RED').setDescription('No animated emoji slots left.')],
            });
        } else if (!emojiData.isAnimated && staticAvail === 0) {
            return interaction.followUp({
                embeds: [embed.setColor('RED').setDescription('No static emoji slots left.')],
            });
        }

        try {
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