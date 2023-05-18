import { KBotCommand, type KBotCommandOptions } from '#extensions/KBotCommand';
import { getUserInfo } from '#utils/Discord';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommandOptions>({
	description: 'Get info on a user.',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('User')
			.setDescription('Get info on a user.')
			.setOptions({ label: '/user <target>' });
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options }, container.moderation);
	}

	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('user')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('target')
							.setDescription('The user or the ID of the user to get info for')
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		await interaction.deferReply();
		const userId = interaction.options.getUser('target', true).id;

		const embed = await getUserInfo(interaction, userId);

		return interaction.editReply({ embeds: [embed] });
	}
}
