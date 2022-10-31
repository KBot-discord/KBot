// Imports
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from "discord-api-types/v10";
import { KBotCommand } from "../../lib/extensions/KBotCommand";

// Types
import type { ChatInputCommand } from '@sapphire/framework';


export class Ping extends KBotCommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
                .setName('ping')
                .setDescription('Ping bot to see if it is alive'),
            {
                idHints: super.getIdHints(this.constructor.name),
                guildIds: super.getGuildIds(),
            }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        const msg = await interaction.reply({ content: `Ping?`, fetchReply: true });
        if (isMessageInstance(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);
            return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
        }
        return interaction.editReply('Failed to retrieve ping :(');
    }
}