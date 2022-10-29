// Imports
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { getIdHint } from "../../lib/util/configuration";
import { PermissionFlagsBits } from "discord-api-types/v10";

// Types
import type { ChatInputCommand } from '@sapphire/framework';


export class Ping extends Command {
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
                idHints: [getIdHint(this.constructor.name)],
                guildIds: ['953375922990506005'],
            }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        const msg = await interaction.reply({ content: `Ping?`, fetchReply: true });
        // @ts-ignore
        if (isMessageInstance(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);
            return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
        }
        return interaction.editReply('Failed to retrieve ping :(');
    }
}