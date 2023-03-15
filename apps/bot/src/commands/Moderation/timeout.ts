import { ModerationAction } from '#structures/ModerationAction';
import { parseTimeString } from '#utils/functions';
import { KBotErrors } from '#types/Enums';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommandOptions>({
	module: 'ModerationModule',
	description: 'Timeout a user.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Timeout')
			.setDescription('Timeout a user.')
			.setOptions({ label: '/timeout <user> <reason> <duration> [dm] [silent]' });
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
					.setName('timeout')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user to timeout')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('The reason for the timeout')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('duration')
							.setDescription('Amount of time to timeout for. Cannot be longer than 28 days')
							.setRequired(true)
					)
					.addBooleanOption((option) =>
						option //
							.setName('dm')
							.setDescription('If the user should be messaged with the reason. (default: true)')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('silent')
							.setDescription('True: timeout will not show in logs, False: timeout will show in logs. (default: false)')
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

		const member = interaction.options.getMember('user');
		if (isNullish(member)) {
			return interaction.defaultReply('That user is not in this server.');
		}

		const { result, error } = await moderation.canTimeoutTarget(interaction.member, member);
		if (!result) {
			return interaction.client.emit(KBotErrors.ModerationPermissions, { interaction, error });
		}

		const durationString = interaction.options.getString('duration');
		const reason = interaction.options.getString('reason');
		const sendDm = interaction.options.getBoolean('dm');
		const silent = interaction.options.getBoolean('silent');

		const expiresIn = parseTimeString(durationString);
		if (isNullish(expiresIn)) {
			return interaction.errorReply('Invalid time format');
		}

		const settings = await this.module.getSettings(interaction.guildId);
		if (isNullish(settings)) {
			return interaction.errorReply("Something went wrong when fetching this server's settings.");
		}

		await new ModerationAction(settings, interaction.member) //
			.timeout(member, { reason, sendDm, silent, expiresIn });

		return interaction.defaultReply(`**${member.user.tag}** has been timed out.`);
	}
}
