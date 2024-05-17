import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import { PollMenu } from '../../lib/structures/menus/PollMenu.js';
import type { PollOption } from '../../lib/types/CustomIds.js';
import { KBotErrors, KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors, KBotEmoji, POLL_NUMBERS, POLL_TIME_LIMIT } from '../../lib/utilities/constants.js';
import { PollCustomIds } from '../../lib/utilities/customIds.js';
import { buildCustomId } from '../../lib/utilities/discord.js';
import { parseTimeString } from '../../lib/utilities/functions.js';
import type { UtilityModule } from '../../modules/UtilityModule.js';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Utility,
	description: 'Create, end, or manage polls.',
	preconditions: ['EDefer', 'ModuleEnabled'],
	requiredClientPermissions: [
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Poll')
			.setSubcommands([
				{
					label: '/poll create <channel> <time> <option1> <option2> [option3 - option10]',
					description: 'Create a poll. There must be at least 2 choices.',
				}, //
				{ label: '/poll menu', description: 'Show the menu for controlling timed polls' },
			]);
	},
	subcommands: [
		{ name: 'create', chatInputRun: 'chatInputCreate' },
		{ name: 'menu', chatInputRun: 'chatInputMenu' },
	],
})
export class UtilityCommand extends KBotSubcommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
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
									.setRequired(true),
							)
							.addStringOption((option) =>
								option //
									.setName('time')
									.setDescription('Time the poll will run for.')
									.setRequired(true),
							)
							.addStringOption((option) =>
								option //
									.setName('option1')
									.setDescription('Option 1')
									.setRequired(true),
							)
							.addStringOption((option) =>
								option //
									.setName('option2')
									.setDescription('Option 2')
									.setRequired(true),
							)
							.addStringOption((option) =>
								option //
									.setName('option3')
									.setDescription('Option 3')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option4')
									.setDescription('Option 4')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option5')
									.setDescription('Option 5')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option6')
									.setDescription('Option 6')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option7')
									.setDescription('Option 7')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option8')
									.setDescription('Option 8')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option9')
									.setDescription('Option 9')
									.setRequired(false),
							)
							.addStringOption((option) =>
								option //
									.setName('option10')
									.setDescription('Option 10')
									.setRequired(false),
							),
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('menu')
							.setDescription('Show the menu for managing polls'),
					),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public async chatInputCreate(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const { polls } = this.module;

		const { result, error } = await this.container.validator.channels.canSendEmbeds(interaction.channel);
		if (!result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const count = await this.module.polls.count(interaction.guildId);
		if (count >= 10) {
			return await interaction.errorReply('There can only be a maximum of 10 active polls.');
		}

		const text = interaction.options.getString('question', true);
		const time = interaction.options.getString('time', true);

		const options = this.formatOptions(interaction);
		if (options.length < 2) {
			return await interaction.errorReply('You must provide at least 2 choices');
		}

		const expiresIn = parseTimeString(time);
		if (isNullOrUndefined(expiresIn)) {
			return await interaction.errorReply(
				'Invalid time format. You can find info about time formats here: https://docs.kbot.ca/references/time-format',
			);
		}
		if (!isNullOrUndefined(expiresIn) && expiresIn > Date.now() + POLL_TIME_LIMIT) {
			return await interaction.errorReply('You cannot run a poll for longer than a month.');
		}

		const expiresAt = expiresIn + Date.now();

		const pollMessage = await interaction.channel!.send({
			embeds: this.createPollEmbeds(interaction.user.username, text, options, expiresAt),
		});

		await polls.create(pollMessage.guildId, pollMessage.id, {
			title: text,
			options,
			time: BigInt(expiresAt),
			channelId: pollMessage.channelId,
			creator: interaction.user.username,
		});
		await polls.createTask(expiresIn, { guildId: pollMessage.guildId, pollId: pollMessage.id });

		await pollMessage.edit({
			embeds: pollMessage.embeds,
			components: this.createPollButtons(options),
		});

		return await interaction.successReply(`${KBotEmoji.GreenCheck} Poll created`);
	}

	public async chatInputMenu(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		return await new PollMenu(interaction.guild).run(interaction);
	}

	/**
	 * Format the provided options from the interaction.
	 * @param interaction - The interaction
	 */
	private formatOptions(interaction: KBotSubcommand.ChatInputCommandInteraction): string[] {
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
				.setTimestamp(),
		];

		if (!isNullOrUndefined(expiresAt)) {
			embeds.push(
				new EmbedBuilder()
					.setColor(EmbedColors.Success)
					.setTitle('Poll ends in:')
					.setDescription(`<t:${Math.floor(expiresAt / 1000)}:R>`),
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
						option: String(iteration),
					});
					components.push(
						new ButtonBuilder().setCustomId(key).setEmoji(POLL_NUMBERS[iteration]).setStyle(ButtonStyle.Primary),
					);
				} else {
					break;
				}
			}

			rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(components));
		}

		return rows;
	}
}
