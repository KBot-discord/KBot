import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { roleMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { Role } from 'discord.js';
import type { UtilityModule } from '../../modules/UtilityModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'UtilityModule',
	description: 'Discord status',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages]
})
export class KBotCommand extends ModuleCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (this.description && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('roledump')
					.setDescription('Check which users have the specified role (must be less than 100)')
					.addRoleOption((option) =>
						option //
							.setName('role')
							.setDescription('Select the role or provide a role ID to check')
							.setRequired(true)
					),
			{ idHints: ['1041955418915745832'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputInteraction) {
		await interaction.deferReply();
		const role = interaction.options.getRole('role', true) as Role;

		if (role.members.size > 100) {
			return interaction.errorReply("Can't show roles with more than 100 members");
		}
		if (role.members.size === 0) {
			return interaction.editReply({
				content: `Users which have: ${roleMention(role.id)} (0)\n\nNo users`
			});
		}

		const userList = role.members.map(({ user }) => `${user.tag} - \`\`${user.id}\`\``);

		return interaction.editReply({
			content: `Users which have: ${roleMention(role.id)} (${userList.length}) \n\n${userList.join('\n')}`
		});
	}
}
