import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { roleMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { UtilityModule } from '#modules/UtilityModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'UtilityModule',
	description: 'Get the current users in a role. Limit is 100 users.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true
	}
})
export class UtilityCommand extends ModuleCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (this.description && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('roledump')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addRoleOption((option) =>
						option //
							.setName('role')
							.setDescription('The role to check')
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);

		if (role.members.size > 100) {
			return interaction.errorReply("Can't show roles with more than 100 members");
		}
		if (role.members.size === 0) {
			return interaction.editReply({
				content: `Users which have: ${roleMention(role.id)} (0)\n\nNo users`
			});
		}

		const userList = role.members.map(({ user }) => `${user.tag} - \`${user.id}\``);

		return interaction.editReply({
			content: `Users which have: ${roleMention(role.id)} (${userList.length}) \n\n${userList.join('\n')}`
		});
	}
}
