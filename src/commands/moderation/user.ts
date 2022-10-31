// Imports
import { Command } from '@sapphire/framework';
import { getUserInfo } from "../../lib/util";
import { PermissionFlagsBits } from "discord-api-types/v10";

// Types
import type { ChatInputCommand } from '@sapphire/framework';
import {KBotCommand} from "../../lib/extensions/KBotCommand";


export class UserInfo extends KBotCommand {
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
            idHints: super.getIdHints(this.constructor.name),
            guildIds: super.getGuildIds(),
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