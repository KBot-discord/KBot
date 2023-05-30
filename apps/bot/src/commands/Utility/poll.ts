import { PollMenu } from '#structures/menus/PollMenu';
import { PollCustomIds } from '#utils/customIds';
import { EmbedColors, KBotEmoji, POLL_NUMBERS, POLL_TIME_LIMIT } from '#utils/constants';
import { buildCustomId, isNullOrUndefined, parseTimeString } from '#utils/functions';
import { KBotCommand } from '#extensions/KBotCommand';
import { KBotErrors, KBotModules } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { UtilityModule } from '#modules/UtilityModule';
import type { PollOption } from '#types/CustomIds';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Utility,
	description: 'Create, end, or manage polls.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Poll')
			.setSubcommands([
				{
					label: '/poll create <channel> <time> <option1> <option2> [option3 - option10]',
					description: 'Create a poll. There must be at least 2 choices.'
				}, //
				{ label: '/poll menu', description: 'Show the menu for controlling timed polls' }
			]);
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('poll')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('create')
							.setDescription('Create a poll. There must be at least 2 options.')
							.addStringOption((option) =>
								option //
									.setName('question')
									.setDescription('The question or topic of the poll')
									.setRequired(true)
							)
							.addStringOption((option) =>
								option //
									.setName('time')
									.setDescription('Time the poll will run for.')
									.setRequired(true)
							)
							.addStringOption((option) =>
								option //
									.setName('option1')
									.setDescription('Option 1')
									.setRequired(true)
							)
							.addStringOption((option) =>
								option //
									.setName('option2')
									.setDescription('Option 2')
									.setRequired(true)
							)
							.addStringOption((option) =>
								option //
									.setName('option3')
									.setDescription('Option 3')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option4')
									.setDescription('Option 4')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option5')
									.setDescription('Option 5')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option6')
									.setDescription('Option 6')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option7')
									.setDescription('Option 7')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option8')
									.setDescription('Option 8')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option9')
									.setDescription('Option 9')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('option10')
									.setDescription('Option 10')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('menu')
							.setDescription('Show the menu for managing polls')
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply({ ephemeral: true });
		switch (interaction.options.getSubcommand(true)) {
			case 'create':
				return this.chatInputCreate(interaction);
			case 'menu':
				return this.chatInputMenu(interaction);
			default:
				return this.unknownSubcommand(interaction);
		}
	}

	public async chatInputCreate(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { polls } = this.module;

		const { result, error } = await this.container.validator.channels.canSendEmbeds(interaction.channel);
		if (!result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const count = await this.module.polls.count(interaction.guildId);
		if (count >= 10) {
			return interaction.errorReply('There can only be a maximum of 10 active polls.');
		}

		const text = interaction.options.getString('question', true);
		const time = interaction.options.getString('time', true);

		const options = this.formatOptions(interaction);
		if (options.length < 2) {
			return interaction.errorReply('You must provide at least 2 choices');
		}

		const expiresIn = parseTimeString(time);
		if (isNullOrUndefined(expiresIn)) {
			return interaction.errorReply('Invalid time format. You can find info about time formats here: https://docs.kbot.ca/references/time-format');
		}
		if (!isNullOrUndefined(expiresIn) && expiresIn > Date.now() + POLL_TIME_LIMIT) {
			return interaction.errorReply('You cannot run a poll for longer than a month.');
		}

		const expiresAt = expiresIn + Date.now();

		const pollMessage = await interaction.channel!.send({
			embeds: this.createPollEmbeds(interaction.user.tag, text, options, expiresAt)
		});

		await polls.create(pollMessage.guildId, pollMessage.id, {
			title: text,
			options,
			time: BigInt(expiresAt),
			channelId: pollMessage.channelId,
			creator: interaction.user.tag
		});
		await polls.createTask(expiresIn, { guildId: pollMessage.guildId, pollId: pollMessage.id });

		await pollMessage.edit({
			embeds: pollMessage.embeds,
			components: this.createPollButtons(options)
		});

		return interaction.successReply(`${KBotEmoji.GreenCheck} Poll created`);
	}

	public async chatInputMenu(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		return new PollMenu(interaction.guild).run(interaction);
	}

	/**
	 * Format the provided options from the interaction.
	 * @param interaction - The interaction
	 */
	private formatOptions(interaction: KBotCommand.ChatInputCommandInteraction): string[] {
		const options: string[] = [];

		for (let i = 0, j = 0; i < 10; i++) {
			const option = interaction.options.getString(`option${i + 1}`);
			if (!isNullOrUndefined(option)) {
				options.push(`${POLL_NUMBERS[j]} ${option}`);
				j++;
			}
		}

		return options;
	}

	/**
	 * Create the embeds for a poll.
	 * @param userTag - The user's tag
	 * @param text - The poll's title
	 * @param options - The poll's options
	 * @param expiresAt - When the poll ends
	 */
	private createPollEmbeds(userTag: string, text: string, options: string[], expiresAt?: number): EmbedBuilder[] {
		const embeds = [
			new EmbedBuilder()
				.setColor(EmbedColors.Default)
				.setTitle(text)
				.setDescription(options.join('\n'))
				.setFooter({ text: `Poll made by ${userTag}` })
				.setTimestamp()
		];

		if (!isNullOrUndefined(expiresAt)) {
			embeds.push(
				new EmbedBuilder()
					.setColor(EmbedColors.Success)
					.setTitle('Poll ends in:')
					.setDescription(`<t:${Math.floor(expiresAt / 1000)}:R>`)
			);
		}

		return embeds;
	}

	/**
	 * Create the buttons based on the poll's options.
	 * @param options - The options
	 */
	private createPollButtons(options: string[]): ActionRowBuilder<ButtonBuilder>[] {
		const rows = [];

		for (let i = 0; i < Math.ceil(options.length / 5); i++) {
			const components: ButtonBuilder[] = [];

			for (let j = 0; j < 5; j++) {
				const iteration = j + i * 5;

				if (options[iteration]) {
					const key = buildCustomId<PollOption>(PollCustomIds.Vote, {
						option: String(iteration)
					});
					components.push(new ButtonBuilder().setCustomId(key).setEmoji(POLL_NUMBERS[iteration]).setStyle(ButtonStyle.Primary));
				} else {
					break;
				}
			}

			rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(components));
		}

		return rows;
	}
}
