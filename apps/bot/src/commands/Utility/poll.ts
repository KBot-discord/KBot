import { PollMenu } from '#structures/menus/PollMenu';
import { buildCustomId, PollCustomIds } from '#utils/customIds';
import { EmbedColors, Emoji, POLL_NUMBERS, POLL_TIME_LIMIT } from '#utils/constants';
import { parseTimeString } from '#utils/functions';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { KBotErrors } from '#types/Enums';
import { ButtonStyle, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { UtilityModule } from '#modules/UtilityModule';
import type { PollOption } from '#types/CustomIds';

@ApplyOptions<KBotCommandOptions>({
	module: 'UtilityModule',
	description: 'Create, end, or manage polls.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true, ephemeral: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Poll')
			.setDescription('Create, end, or manage polls.')
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
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
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

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'create': {
				return this.chatInputCreate(interaction);
			}
			case 'menu': {
				return this.chatInputMenu(interaction);
			}
			default: {
				return interaction.client.emit(KBotErrors.UnknownCommand, { interaction });
			}
		}
	}

	public async chatInputCreate(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { polls } = this.module;

		const { result, error } = await this.container.validator.channels.canSendEmbeds(interaction.channel);
		if (!result) {
			return interaction.client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const count = await this.module.polls.count({
			guildId: interaction.guildId
		});
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
		if (isNullish(expiresIn)) {
			return interaction.errorReply('Invalid time format');
		}
		if (!isNullish(expiresIn) && expiresIn > Date.now() + POLL_TIME_LIMIT) {
			return interaction.errorReply('Cannot run a poll for longer than a month');
		}

		const expiresAt = isNullish(expiresIn) ? undefined : expiresIn + Date.now();

		const pollMessage = await interaction.channel!.send({
			embeds: this.createPollEmbeds(interaction.user.tag, text, options, expiresAt)
		});

		if (isNullish(expiresAt)) {
			await polls.create(
				{ guildId: pollMessage.guildId, pollId: pollMessage.id },
				{
					title: text,
					options,
					channelId: pollMessage.channelId,
					creator: interaction.user.tag
				}
			);
		} else {
			await polls.create(
				{ guildId: pollMessage.guildId, pollId: pollMessage.id },
				{
					title: text,
					options,
					time: BigInt(expiresAt),
					channelId: pollMessage.channelId,
					creator: interaction.user.tag
				}
			);
			polls.createTask(expiresIn!, { guildId: pollMessage.guildId, pollId: pollMessage.id });
		}

		await pollMessage.edit({
			embeds: pollMessage.embeds,
			components: this.createPollButtons(options)
		});

		return interaction.successReply(`${Emoji.GreenCheck} Poll created`);
	}

	public async chatInputMenu(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		return new PollMenu(interaction.guild).run(interaction);
	}

	private formatOptions(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): string[] {
		const options: string[] = [];

		for (let i = 0, j = 0; i < 10; i++) {
			const option = interaction.options.getString(`option${i + 1}`);
			if (!isNullish(option)) {
				options.push(`${POLL_NUMBERS[j]} ${option}`);
				j++;
			}
		}

		return options;
	}

	private createPollEmbeds(userTag: string, text: string, choices: string[], expiresAt?: number): EmbedBuilder[] {
		const embeds = [
			new EmbedBuilder()
				.setColor(EmbedColors.Default)
				.setTitle(text)
				.setDescription(choices.join('\n'))
				.setFooter({ text: `Poll made by ${userTag}` })
				.setTimestamp()
		];

		if (!isNullish(expiresAt)) {
			embeds.push(
				new EmbedBuilder()
					.setColor(EmbedColors.Success)
					.setTitle('Poll ends in:')
					.setDescription(`<t:${Math.floor(expiresAt! / 1000)}:R>`)
			);
		}

		return embeds;
	}

	private createPollButtons(options: string[]): ActionRowBuilder<ButtonBuilder>[] {
		const rows = [];

		for (let i = 0; i < Math.ceil(options.length / 5); i++) {
			const components: ButtonBuilder[] = [];

			for (let j = 0; j < 5; j++) {
				const iteration = j + i * 5;

				if (options[iteration]) {
					const key = buildCustomId<PollOption>(PollCustomIds.Vote, {
						option: `${iteration}`
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
