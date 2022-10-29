// Imports
import { Command } from '@sapphire/framework';
import { MessageEmbed } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { getIdHint } from "../../lib/util/configuration";

// Types
import type { ChatInputCommand } from '@sapphire/framework';
import type { Message } from "discord.js";


export class Echo extends Command {
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
                idHints: [getIdHint(this.constructor.name)],
                guildIds: ['953375922990506005'],
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