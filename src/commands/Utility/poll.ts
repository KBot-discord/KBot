// Imports
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand';
import {
 MessageActionRow, MessageButton, MessageEmbed,
} from 'discord.js';
import { parseTimeString } from '../../lib/util/util';
import { embedColors } from '../../lib/util/constants';


const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const TIME_LIMIT = 604800000; // 7 days

@ApplyOptions<Subcommand.Options>({
    description: 'Get info on the selected user or provided ID',
    detailedDescription: 'Displays all the info about a user such as: creation date, join date, if they are in the server, if they are banned (and ban reason if applicable).',
    requiredClientPermissions: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
    ],
})
export class PollCommand extends KBotSubcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            subcommands: [
                { name: 'create', chatInputRun: 'chatInputCreate' },
                { name: 'end', chatInputRun: 'chatInputEnd' },
                { name: 'results', chatInputRun: 'chatInputResults' },
            ],
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(
            (builder) => builder
                    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
                    .setName('poll')
                    .setDescription(this.description)
                    .addSubcommand((create) => create
                            .setName('create')
                            .setDescription('Create a poll. There must be at least 2 choices.')
                            .addStringOption((option) => option
                                    .setName('question')
                                    .setDescription('The question or topic of the poll')
                                    .setRequired(true))
                            .addStringOption((option) => option
                                    .setName('time')
                                    .setDescription('Time the poll will run for. Set nothing for no time limit. Format is 1d2h3m (days, hours, minutes)'))
                            .addStringOption((option) => option
                                    .setName('option1')
                                    .setDescription('Option 1'))
                            .addStringOption((option) => option
                                    .setName('option2')
                                    .setDescription('Option 2'))
                            .addStringOption((option) => option
                                    .setName('option3')
                                    .setDescription('Option 3'))
                            .addStringOption((option) => option
                                    .setName('option4')
                                    .setDescription('Option 4'))
                            .addStringOption((option) => option
                                    .setName('option5')
                                    .setDescription('Option 5'))
                            .addStringOption((option) => option
                                    .setName('option6')
                                    .setDescription('Option 6'))
                            .addStringOption((option) => option
                                    .setName('option7')
                                    .setDescription('Option 7'))
                            .addStringOption((option) => option
                                    .setName('option8')
                                    .setDescription('Option 8'))
                            .addStringOption((option) => option
                                    .setName('option9')
                                    .setDescription('Option 9'))
                            .addStringOption((option) => option
                                    .setName('option10')
                                    .setDescription('Option 10')))
                    .addSubcommand((end) => end
                            .setName('end')
                            .setDescription('End an ongoing timed poll')
                            .addStringOption((option) => option
                                    .setName('message')
                                    .setDescription('Provide a message ID or link')
                                    .setRequired(true)))
                    .addSubcommand((results) => results
                            .setName('results')
                            .setDescription('Show the results of a poll (if timed, this will not end it)')
                            .addStringOption((option) => option
                                    .setName('message')
                                    .setDescription('Provide a message ID or link')
                                    .setRequired(true))
                            .addChannelOption((option) => option
                                    .setName('channel')
                                    .setDescription('Select the channel which the poll is in')
                                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                                    .setRequired(true))),
            {
                idHints: super.getIdHints(this.name),
                guildIds: super.getGuildIds(),
            },
        );
    }

    public async chatInputCreate(interaction: Subcommand.ChatInputInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const text = interaction.options.getString('question', true);
        const time = interaction.options.getString('time');

        const options = this.formatOptions(interaction);
        if (!options) {
            return interaction.errorReply('You must provide at least 2 choices');
        }

        const parsedTime = parseTimeString(time);
        if (!!time && !parsedTime) {
            return interaction.errorReply('Invalid time format');
        }
        if (!!parsedTime && parsedTime > Date.now() + TIME_LIMIT) {
            return interaction.errorReply('Cannot run a poll for longer than a week');
        }

        await interaction.defaultReply('Creating poll...');

        const embeds = this.createPollEmbeds(interaction, text, options, parsedTime ?? undefined);
        const initialMessage = await interaction.channel!.send({ embeds });

        const buttons = this.createPollButtons(initialMessage.id, options);
        await initialMessage.edit({ embeds, components: buttons });

        // TODO: Save poll message id and expiry in db/redis
        // const message = await initialMessage.edit({ embeds, components: buttons });
        // await container.redis.addSortedSet(key, member, data);

        return interaction.successReply(':white_check_mark: Poll created');
    }

    public async chatInputEnd(interaction: Subcommand.ChatInputInteraction) {
        await interaction.deferReply();
        return interaction.editReply({ content: 'end' });
    }

    public async chatInputResults(interaction: Subcommand.ChatInputInteraction) {
        await interaction.deferReply();
        return interaction.editReply({ content: 'results' });
    }

    private formatOptions(interaction: Subcommand.ChatInputInteraction): string[] | null {
        const options: string[] = [];
        for (let i = 0; i < 10; i++) {
            if (interaction.options.getString(`option${i + 1}`)) {
                options.push(`${numbers[i]} ${interaction.options.getString(`option${i + 1}`)}`);
            } else break;
        }
        if (options.length < 2) return null;
        return options;
    }

    private createPollEmbeds(interaction: Subcommand.ChatInputInteraction, text: string, choices: string[], expiresAt?: number): MessageEmbed[] {
        const embeds = [
            new MessageEmbed()
                .setColor(embedColors.default)
                .setTitle(text)
                .setDescription(choices.join('\n'))
                .setFooter({ text: `Poll made by ${interaction.user.tag}` })
                .setTimestamp(),
        ];
        if (expiresAt) {
            embeds.push(
                new MessageEmbed()
                    .setColor(embedColors.success)
                    .setTitle('Poll ends in:')
                    .setDescription(`<t:${Math.floor(expiresAt! / 1000)}:R>`),
            );
        }
        return embeds;
    }

    private createPollButtons(messageId: string, options: string[]): MessageActionRow[] {
        const rows = [];
        for (let i = 0; i < Math.ceil(options.length / 5); i++) {
            const components: MessageButton[] = [];
            for (let j = 0; j < 5; j++) {
                const iteration = j + i * 5;
                if (options[iteration]) {
                    components.push(
                    new MessageButton()
                        .setCustomId(`category:poll;message:${messageId};option:${iteration}`)
                        .setEmoji(numbers[iteration])
                        .setStyle('SECONDARY'),
                    );
                } else break;
            }
            rows.push(new MessageActionRow().addComponents(components));
        }
        return rows;
    }
}
