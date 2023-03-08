import { ModerationAction } from '#structures/ModerationAction';
import { KBotErrors } from '#types/Enums';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Ban a user.',
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
					.setName('ban')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user or provide an ID to ban')
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option //
							.setName('messages')
							.setDescription('The amount of messages to purge. (default: 1 day)')
							.setRequired(false)
							.addChoices(
								{ name: 'Do not purge', value: 0 },
								{ name: '24 hours', value: 1 },
								{ name: '3 days', value: 3 },
								{ name: '7 days', value: 7 }
							)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('The reason for the ban. (default: "No reason provided.")')
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
							.setDescription('True: ban will not show in logs, False: ban will show in logs. (default: false)')
							.setRequired(false)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { moderation } = this.container.validator;

		const user = interaction.options.getUser('user', true);
		const member = interaction.options.getMember('user');

		if (!isNullish(member)) {
			const { result, error } = moderation.canBanTarget(interaction.member, member);
			if (!result) {
				return interaction.client.emit(KBotErrors.ModerationPermissions, { interaction, error });
			}
		}

		const settings = await this.module.getSettings(interaction.guildId);
		if (isNullish(settings)) {
			return interaction.errorReply("Something went wrong when fetching this server's settings.");
		}

		const daysToPurge = interaction.options.getInteger('messages');
		const reason = interaction.options.getString('reason');
		const sendDm = interaction.options.getBoolean('dm');
		const silent = interaction.options.getBoolean('silent');

		return new ModerationAction(settings, interaction.member) //
			.ban(member ?? user, { reason, sendDm, silent, daysToPurge });
	}
}
