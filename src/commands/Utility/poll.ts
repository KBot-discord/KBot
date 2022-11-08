// Imports
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { parseTimeString } from '../../lib/util/util';
import { embedColors, POLL_NUMBERS, POLL_TIME_LIMIT } from '../../lib/util/constants';
import { getGuildIds, getIdHints } from '../../lib/util/config';
import { buildKey } from '../../lib/util/keys';
import type { IPollCustomId } from '../../lib/types/keys';
import { PollCustomId } from '../../lib/types/enums';

@ApplyOptions<Subcommand.Options>({
	description: 'Get info on the selected user or provided ID',
	detailedDescription:
		'Displays all the info about a user such as: creation date, join date, if they are in the server, if they are banned (and ban reason if applicable).',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class PollCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			subcommands: [
				{ name: 'create', chatInputRun: 'chatInputCreate' },
				{ name: 'end', chatInputRun: 'chatInputEnd' },
				{ name: 'results', chatInputRun: 'chatInputResults' }
			]
		});
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
							.setName('end')
							.setDescription('End an ongoing timed poll')
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('Provide a message ID or link')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('results')
							.setDescription('Show the results of a poll (if timed, this will not end it)')
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('Provide a message ID or link')
									.setRequired(true)
							)
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('Select the channel which the poll is in')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
									.setRequired(true)
							)
					),
			{ idHints: getIdHints(this.name), guildIds: getGuildIds() }
		);
	}

	public async chatInputCreate(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const text = interaction.options.getString('question', true);
		const time = interaction.options.getString('time');

		const options = this.formatOptions(interaction);
		if (isNullish(options)) {
			return interaction.errorReply('You must provide at least 2 choices');
		}

		const expiresIn = parseTimeString(time);
		if (!isNullish(time) && !expiresIn) {
			return interaction.errorReply('Invalid time format');
		}
		if (!isNullish(expiresIn) && expiresIn > Date.now() + POLL_TIME_LIMIT) {
			return interaction.errorReply('Cannot run a poll for longer than a week');
		}

		await interaction.defaultReply('Creating poll...');
		const expiresAt = expiresIn ? expiresIn + Date.now() : undefined;
		const message = await interaction.channel!.send({
			embeds: this.createPollEmbeds(interaction.user.tag, text, options, expiresAt),
			components: this.createPollButtons(options)
		});

		if (expiresAt) {
			await this.container.polls.createPoll(message, options, expiresAt);
			await this.container.polls.createPollTask(message, expiresIn!);
		}
		return interaction.successReply(':white_check_mark: Poll created');
	}

	public async chatInputEnd(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const messageId = interaction.options.getString('message', true);

		const poll = await this.container.polls.getPoll(messageId);
		if (isNullish(poll)) return interaction.errorReply('Invalid message ID.');

		// TODO verify that this actually deletes the task
		await this.container.polls.endPoll(poll.id, poll.channel);
		await this.container.polls.deletePollTask(poll.id);

		return interaction.successReply(':white_check_mark: Poll ended');
	}

	public async chatInputResults(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		// const channel = interaction.options.getChannel('channel', true);
		// const message = interaction.options.getString('message', true);

		return interaction.successReply(':white_check_mark: Results sent');
	}

	private formatOptions(interaction: Subcommand.ChatInputInteraction): string[] | null {
		const options: string[] = [];
		for (let i = 0; i < 10; i++) {
			if (interaction.options.getString(`option${i + 1}`)) {
				options.push(`${POLL_NUMBERS[i]} ${interaction.options.getString(`option${i + 1}`)}`);
			} else break;
		}
		if (options.length < 2) return null;
		return options;
	}

	private createPollEmbeds(userTag: string, text: string, choices: string[], expiresAt?: number): MessageEmbed[] {
		const embeds = [
			new MessageEmbed()
				.setColor(embedColors.default)
				.setTitle(text)
				.setDescription(choices.join('\n'))
				.setFooter({ text: `Poll made by ${userTag}` })
				.setTimestamp()
		];
		if (expiresAt) {
			embeds.push(
				new MessageEmbed()
					.setColor(embedColors.success)
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
				const iteration = j + i * 5 + 1;
				if (options[iteration]) {
					const key = buildKey<IPollCustomId>(PollCustomId, {
						option: iteration
					});
					components.push(new MessageButton().setCustomId(key).setEmoji(POLL_NUMBERS[iteration]).setStyle('SECONDARY'));
				} else break;
			}
			rows.push(new MessageActionRow().addComponents(components));
		}
		return rows;
	}
}
