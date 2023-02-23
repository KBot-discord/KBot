import { getUserInfo } from '#utils/Discord';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Get info on a user.',
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
					.setName('user')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('target')
							.setDescription('Select a user or provide ID')
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const userId = interaction.options.getUser('target', true).id;

		const embed = await getUserInfo(interaction, userId);

		return interaction.editReply({ embeds: [embed] });
	}
}
