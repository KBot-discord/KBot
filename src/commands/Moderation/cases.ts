import { ModerationCaseMenu } from '#structures/menus/ModerationCaseMenu';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';
import type { ModerationCase } from '#prisma';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'View and edit moderation cases.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true
	}
})
export class ModerationCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
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
			case 'target': {
				return this.chatInputTarget(interaction);
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

	public async chatInputTarget(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { moderation } = this.container;

		const user = interaction.options.getUser('user', true);

		const moderationCases = await moderation.cases.getByUser({
			guildId: interaction.guildId,
			userId: user.id
		});

		return new ModerationCaseMenu(moderationCases).run(interaction);
	}

	private showCase(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, moderationCase: ModerationCase) {
		return interaction.editReply({
			embeds: [this.container.moderation.cases.buildEmbed(moderationCase)]
		});
	}
}
