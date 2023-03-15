import { ModerationCaseMenu } from '#structures/menus/ModerationCaseMenu';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';
import type { ModerationCase } from '#prisma';

@ApplyOptions<KBotCommandOptions>({
	module: 'ModerationModule',
	description: 'View and edit moderation cases.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true, ephemeral: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Cases')
			.setDescription('View and edit moderation cases.')
			.setSubcommands([
				{ label: '/cases view <case_id>', description: 'View a specific moderation case' }, //
				{ label: '/cases edit <case_id> <reason>', description: 'Edit a moderation case' },
				{ label: '/cases <user>', description: "Get a user's moderation cases" }
			]);
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('cases')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('view')
							.setDescription('View a specific moderation case')
							.addNumberOption((option) =>
								option //
									.setName('case_id')
									.setDescription('placeholder')
									.setRequired(true)
							)
					)

					.addSubcommand((subcommand) =>
						subcommand //
							.setName('edit')
							.setDescription('Edit a moderation case')
							.addNumberOption((option) =>
								option //
									.setName('case_id')
									.setDescription('The ID of the case')
									.setRequired(true)
							)
							.addStringOption((option) =>
								option //
									.setName('reason')
									.setDescription('The new reason to set')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('list')
							.setDescription("Get a user's moderation cases")
							.addUserOption((option) =>
								option //
									.setName('user')
									.setDescription('The user to check')
									.setRequired(true)
							)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommand(true)) {
			case 'view': {
				return this.chatInputView(interaction);
			}
			case 'edit': {
				return this.chatInputEdit(interaction);
			}
			case 'list': {
				return this.chatInputList(interaction);
			}
			default: {
				this.container.logger.fatal(`[${this.name}] Hit default switch in`);
				return interaction.errorReply('Something went wrong.');
			}
		}
	}

	public async chatInputView(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { moderation } = this.container;

		const caseId = interaction.options.getNumber('case_id', true);

		const moderationCase = await moderation.cases.get({
			guildId: interaction.guildId,
			caseId
		});
		if (isNullish(moderationCase)) {
			return interaction.errorReply('There is no case with that ID.');
		}

		return this.showCase(interaction, moderationCase);
	}

	public async chatInputEdit(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { moderation } = this.container;

		const caseId = interaction.options.getNumber('case_id', true);
		const reason = interaction.options.getString('reason', true);

		const moderationCase = await moderation.cases.update(
			{ guildId: interaction.guildId, caseId },
			{
				reason
			}
		);

		return this.showCase(interaction, moderationCase);
	}

	public async chatInputList(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { moderation } = this.container;

		const member = interaction.options.getMember('user');

		if (!member) {
			return interaction.defaultReply('That user is not in the server');
		}

		const moderationCases = await moderation.cases.getByUser({
			guildId: interaction.guildId,
			userId: member.id
		});

		return new ModerationCaseMenu(member, moderationCases).run(interaction);
	}

	private showCase(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, moderationCase: ModerationCase) {
		return interaction.editReply({
			embeds: [this.container.moderation.cases.buildEmbed(moderationCase)]
		});
	}
}
