import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { Command } from '@sapphire/framework';
import type { Role } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Discord status',
	preconditions: ['GuildOnly']
})
export class KBotCommand extends Command {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
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

	public async chatInputRun(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const role = interaction.options.getRole('role', true) as Role;

		if (role.members.size > 100) {
			return interaction.errorReply("Can't show roles with more than 100 members");
		}
		if (role.members.size === 0) {
			return interaction.editReply({
				content: `Users which have: <@&${role.id}> (0)\n\nNo users`
			});
		}

		const userList = role.members.map(({ user }) => `${user.tag} - \`\`${user.id}\`\``);

		return interaction.editReply({
			content: `Users which have: <@&${role.id}> (${userList.length}) \n\n${userList.join('\n')}`
		});
	}
}
