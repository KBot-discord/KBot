import { ChatInputCommand, Command } from '@sapphire/framework';

import { getUserInfo } from "../../lib/util";


export class UserInfo extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
                builder
                    .setName('user')
                    .setDescription('Get info on the selected user or provided ID')
                    .addUserOption(option =>
                        option
                            .setName('target')
                            .setDescription('Select a user or provide ID')
                            .setRequired(true)),
        {
                idHints: ['1035784234377416734'],
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