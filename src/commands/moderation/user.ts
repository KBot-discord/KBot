// Imports
import { Command } from '@sapphire/framework';
import { getUserInfo } from "../../lib/util";
import { getIdHint } from "../../lib/util/configuration";
import { PermissionFlagsBits } from "discord-api-types/v10";

// Types
import type { ChatInputCommand } from '@sapphire/framework';


export class UserInfo extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
                    .setName('user')
                    .setDescription('Get info on the selected user or provided ID')
                    .addUserOption(option =>
                        option
                            .setName('target')
                            .setDescription('Select a user or provide ID')
                            .setRequired(true)),
        {
            idHints: [getIdHint(this.constructor.name)],
            guildIds: ['953375922990506005'],
            }
        );
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        await interaction.deferReply();
        const embed = await getUserInfo(interaction, interaction.options.getUser('target', true).id);
        return interaction.editReply({
            embeds: [embed],
        });
    }
}