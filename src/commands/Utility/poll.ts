// Imports
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";
import { ApplyOptions } from "@sapphire/decorators";
import { KBotSubcommand } from "../../lib/extensions/KBotSubcommand";

// Types
import type { ChatInputCommand } from '@sapphire/framework';


@ApplyOptions<Subcommand.Options>({
    name: 'poll',
    description: 'Get info on the selected user or provided ID',
    detailedDescription: 'Displays all the info about a user such as: creation date, join date, if they are in the server, if they are banned (and ban reason if applicable).',
    subcommands: [
        { name: 'create', chatInputRun: 'chatInputCreate' },
        { name: 'end', chatInputRun: 'chatInputEnd' },
        { name: 'results', chatInputRun: 'chatInputResults' }
    ]
})
export class PollCommand extends KBotSubcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {...options});
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
                builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
                    .setName(this.name)
                    .setDescription(this.description)
                    .addSubcommand(create =>
                        create
                            .setName('create')
                            .setDescription('Create a poll. There must be at least 2 choices.')
                            .addStringOption(option =>
                                option
                                    .setName('question')
                                    .setDescription('The question or topic of the poll')
                                    .setRequired(true))
                            .addStringOption(option =>
                                option
                                    .setName('time')
                                    .setDescription('Time the poll will run for. Set nothing for no time limit. Format is 1d2h3m (days, hours, minutes)'))
                            .addStringOption(option =>
                                option
                                    .setName('choice1')
                                    .setDescription('Choice 1'))
                            .addStringOption(option =>
                                option
                                    .setName('choice2')
                                    .setDescription('Choice 2'))
                            .addStringOption(option =>
                                option
                                    .setName('choice3')
                                    .setDescription('Choice 3'))
                            .addStringOption(option =>
                                option
                                    .setName('choice4')
                                    .setDescription('Choice 4'))
                            .addStringOption(option =>
                                option
                                    .setName('choice5')
                                    .setDescription('Choice 5'))
                            .addStringOption(option =>
                                option
                                    .setName('choice6')
                                    .setDescription('Choice 6'))
                            .addStringOption(option =>
                                option
                                    .setName('choice7')
                                    .setDescription('Choice 7'))
                            .addStringOption(option =>
                                option
                                    .setName('choice8')
                                    .setDescription('Choice 8'))
                            .addStringOption(option =>
                                option
                                    .setName('choice9')
                                    .setDescription('Choice 9'))
                            .addStringOption(option =>
                                option
                                    .setName('choice10')
                                    .setDescription('Choice 10')))
                    .addSubcommand(end =>
                        end
                            .setName('end')
                            .setDescription('End an ongoing timed poll')
                            .addStringOption(option =>
                                option
                                    .setName('message')
                                    .setDescription('Provide a message ID or link')
                                    .setRequired(true)))
                    .addSubcommand(results =>
                        results
                            .setName('results')
                            .setDescription('Show the results of a poll')
                            .addStringOption(option =>
                                option
                                    .setName('message')
                                    .setDescription('Provide a message ID or link')
                                    .setRequired(true))
                            .addChannelOption(option =>
                                option
                                    .setName('channel')
                                    .setDescription('Select the channel which the poll is in')
                                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                                    .setRequired(true))),
            {
                idHints: super.getIdHints(this.name),
                guildIds: super.getGuildIds(),
            }
        );
    }

    public async chatInputCreate(interaction: Subcommand.ChatInputInteraction) {}

    public async chatInputEnd(interaction: Subcommand.ChatInputInteraction) {}

    public async chatInputResults(interaction: Subcommand.ChatInputInteraction) {}
}