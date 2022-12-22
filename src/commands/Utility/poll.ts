import { Subcommand } from '@sapphire/plugin-subcommands';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { parseTimeString } from '../../lib/util/util';
import { EmbedColors, POLL_NUMBERS, POLL_TIME_LIMIT } from '../../lib/util/constants';
import { getGuildIds } from '../../lib/util/config';
import { PollCustomIds } from '../../lib/types/CustomIds';
import { PollMenu } from '../../lib/structures/PollMenu';
import { buildCustomId } from '@kbotdev/custom-id';
import type { PollOption } from '../../lib/types/CustomIds';

@ApplyOptions<Subcommand.Options>({
	description: 'Get info on the selected user or provided ID',
	detailedDescription:
		'Displays all the info about a user such as: creation date, join date, if they are in the server, if they are banned (and ban reason if applicable).',
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class PollCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			subcommands: [
				{ name: 'create', chatInputRun: 'chatInputCreate' },
				{ name: 'menu', chatInputRun: 'chatInputMenu' }
			]
		});
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('poll')
					.setDescription(this.description)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('create')
							.setDescription('Create a poll. There must be at least 2 choices.')
							.addStringOption((option) =>
								option //
									.setName('question')
									.setDescription('The question or topic of the poll')
									.setRequired(true)
							)
							.addStringOption((option) =>
								option
									.setName('time')
									.setDescription(
										'Time the poll will run for. Set nothing for no time limit. Format is 1d2h3m (days, hours, minutes)'
									)
							)
							.addStringOption((option) =>
								option //
									.setName('option1')
									.setDescription('Option 1')
							)
							.addStringOption((option) =>
								option //
									.setName('option2')
									.setDescription('Option 2')
							)
							.addStringOption((option) =>
								option //
									.setName('option3')
									.setDescription('Option 3')
							)
							.addStringOption((option) =>
								option //
									.setName('option4')
									.setDescription('Option 4')
							)
							.addStringOption((option) =>
								option //
									.setName('option5')
									.setDescription('Option 5')
							)
							.addStringOption((option) =>
								option //
									.setName('option6')
									.setDescription('Option 6')
							)
							.addStringOption((option) =>
								option //
									.setName('option7')
									.setDescription('Option 7')
							)
							.addStringOption((option) =>
								option //
									.setName('option8')
									.setDescription('Option 8')
							)
							.addStringOption((option) =>
								option //
									.setName('option9')
									.setDescription('Option 9')
							)
							.addStringOption((option) =>
								option //
									.setName('option10')
									.setDescription('Option 10')
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('menu')
							.setDescription('Show the menu for controlling timed polls')
					),
			{ idHints: ['1036859625418530856'], guildIds: getGuildIds() }
		);
	}

	public async chatInputCreate(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { polls } = this.container;

		const text = interaction.options.getString('question', true);
		const time = interaction.options.getString('time');

		const options = this.formatOptions(interaction);
		if (isNullish(options)) {
			return interaction.errorReply('You must provide at least 2 choices');
		}

		const expiresIn = parseTimeString(time);
		if (time && !expiresIn) {
			return interaction.errorReply('Invalid time format');
		}
		if (expiresIn && expiresIn > Date.now() + POLL_TIME_LIMIT) {
			return interaction.errorReply('Cannot run a poll for longer than a week');
		}

		const expiresAt = expiresIn ? expiresIn + Date.now() : undefined;
		const message = await interaction.channel!.send({
			embeds: this.createPollEmbeds(interaction.user.tag, text, options, expiresAt),
			components: this.createPollButtons(options)
		});

		if (expiresAt) {
			await polls.db.createPoll(message, text, options, expiresAt);
			polls.createPollTask(message, expiresIn!);
		}
		return interaction.successReply(':white_check_mark: Poll created');
	}

	public async chatInputMenu(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		return new PollMenu(interaction.guild!).run(interaction);
	}

	private formatOptions(interaction: Subcommand.ChatInputInteraction): string[] | null {
		const options: string[] = [];
		for (let i = 0; i < 10; i++) {
			if (interaction.options.getString(`option${i + 1}`)) {
				options.push(`${POLL_NUMBERS[i]} ${interaction.options.getString(`option${i + 1}`)}`);
			} else break;
		}
		return options.length < 2 ? null : options;
	}

	private createPollEmbeds(userTag: string, text: string, choices: string[], expiresAt?: number): MessageEmbed[] {
		const embeds = [
			new MessageEmbed()
				.setColor(EmbedColors.Default)
				.setTitle(text)
				.setDescription(choices.join('\n'))
				.setFooter({ text: `Poll made by ${userTag}` })
				.setTimestamp()
		];
		if (expiresAt) {
			embeds.push(
				new MessageEmbed()
					.setColor(EmbedColors.Success)
					.setTitle('Poll ends in:')
					.setDescription(`<t:${Math.floor(expiresAt! / 1000)}:R>`)
			);
		}
		return embeds;
	}

	private createPollButtons(options: string[]): MessageActionRow[] {
		const rows = [];
		for (let i = 0; i < Math.ceil(options.length / 5); i++) {
			const components: MessageButton[] = [];
			for (let j = 0; j < 5; j++) {
				const iteration = j + i * 5;
				if (options[iteration]) {
					const key = buildCustomId<PollOption>(PollCustomIds.Vote, {
						option: iteration
					});
					components.push(new MessageButton().setCustomId(key).setEmoji(POLL_NUMBERS[iteration]).setStyle('PRIMARY'));
				} else break;
			}
			rows.push(new MessageActionRow().addComponents(components));
		}
		return rows;
	}
}
