// Imports
import { Command } from '@sapphire/framework';
import { MessageEmbed } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";

// Types
import type { ChatInputCommand } from '@sapphire/framework';
import type { Message } from "discord.js";
import {KBotCommand} from "../../lib/extensions/KBotCommand";


export class Echo extends KBotCommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
                    .setName('echo')
                    .setDescription('Sends the provided message in the chosen channel')
                    .addStringOption(acc =>
                        acc
                            .setName('message')
                            .setDescription('Message you want to send')
                            .setRequired(true))
                    .addChannelOption(chan =>
                        chan
                            .setName('channel')
                            .setDescription('Select a channel to send the message in')
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                            .setRequired(true)),

            {
                idHints: super.getIdHints(this.constructor.name),
                guildIds: super.getGuildIds(),
            }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        await interaction.deferReply();
        const message = interaction.options.getString('message', true);
        const channel: any = interaction.options.getChannel('channel', true);

        await channel.send({
            content: message,
            allowedMentions: { parse: ['users'] },
        }).then((msg: Message) => {
            return interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor('#33B54E')
                    .setAuthor({ name: 'Message sent' })
                    .setDescription(`**Channel:** <#${channel.id}>\n**Message:**\n\`\`\`${msg.content}\`\`\``)],
            });
        });

    }
}