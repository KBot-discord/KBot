// Imports
import { Command } from '@sapphire/framework';
import { getUserInfo } from "../../lib/util/util";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { KBotCommand } from "../../lib/extensions/KBotCommand";
import { ApplyOptions } from "@sapphire/decorators";

// Types
import type { ChatInputCommand } from '@sapphire/framework';


@ApplyOptions<ChatInputCommand.Options>({
    name: 'user',
    description: 'Get info on the selected user or provided ID.',
    detailedDescription: 'Displays all the info about a user such as: creation date, join date, if they are in the server, if they are banned (and ban reason if applicable).',
})
export class UserInfoCommand extends KBotCommand {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
                    .setName(this.name)
                    .setDescription(this.description)
                    .addUserOption(option =>
                        option
                            .setName('target')
                            .setDescription('Select a user or provide ID')
                            .setRequired(true)),
        {
            idHints: super.getIdHints(this.name),
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