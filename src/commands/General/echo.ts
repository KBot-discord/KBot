// Imports
import { Command } from '@sapphire/framework';
import { MessageEmbed } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { KBotCommand } from "../../lib/extensions/KBotCommand";
import { ApplyOptions } from "@sapphire/decorators";

// Types
import type { ChatInputCommand } from '@sapphire/framework';
import type { Message } from "discord.js";


@ApplyOptions<ChatInputCommand.Options>({
    name: 'echo',
    description: 'Sends the provided message to the selected channel.',
})
export class EchoCommand extends KBotCommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
                    .setName(this.name)
                    .setDescription(this.description)
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
                idHints: super.getIdHints(this.name),
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