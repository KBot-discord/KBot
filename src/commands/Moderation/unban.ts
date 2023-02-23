import { ModerationAction } from '#lib/structures/ModerationAction';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Unban a user.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
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
					.setName('unban')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Enter a user ID to unban')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('The reason for the unban. (default: "No reason provided.")')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('dm')
							.setDescription('If the user should be messaged with the reason. (default: false)')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option
							.setName('silent')
							.setDescription('True: unban will not show in logs, False: unban will show in logs. (default: false)')
							.setRequired(false)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user', true);
		const member = interaction.options.getMember('user');

		if (!isNullish(member)) {
			return interaction.errorReply('You cannot unban a user that is in the server.');
		}

		const settings = await this.module.getSettings(interaction.guildId);
		if (isNullish(settings)) {
			return interaction.errorReply("Something went wrong when fetching this server's settings.");
		}

		const reason = interaction.options.getString('reason');
		const sendDm = interaction.options.getBoolean('dm');
		const silent = interaction.options.getBoolean('silent');

		return new ModerationAction(settings, interaction.member) //
			.unban(user, { reason, sendDm, silent });
	}
}
