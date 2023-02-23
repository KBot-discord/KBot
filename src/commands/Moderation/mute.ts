import { ModerationAction } from '#lib/structures/ModerationAction';
import { parseTimeString } from '#utils';
import { KBotErrors } from '#types/Enums';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Mute a user.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
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
					.setName('mute')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user or provide an ID to mute')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('The reason for the mute')
							.setRequired(true)
					)
					.addBooleanOption((option) =>
						option //
							.setName('dm')
							.setDescription('If the user should be messaged with the reason. (default: true)')
							.setRequired(false)
					)
					.addStringOption((option) =>
						option //
							.setName('duration')
							.setDescription('Amount of time to mute for. Cannot be longer than 30 days. (default: indefinite)')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('silent')
							.setDescription('True: mute will not show in logs, False: mute will show in logs. (default: false)')
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

		const settings = await this.module.getSettings(interaction.guildId);
		if (isNullish(settings) || isNullish(settings.muteRoleId)) {
			return interaction.errorReply("Something went wrong when fetching this server's settings.");
		}

		const muted = await this.module.mutes.isMuted(member, settings.muteRoleId);
		if (muted) {
			return interaction.errorReply('User is already muted.');
		}

		const { result, error } = await moderation.canMuteTarget(interaction.member, member, settings.muteRoleId);
		if (!result) {
			return interaction.client.emit(KBotErrors.ModerationPermissions, { interaction, error });
		}

		const durationString = interaction.options.getString('duration');
		const reason = interaction.options.getString('reason');
		const sendDm = interaction.options.getBoolean('dm');
		const silent = interaction.options.getBoolean('silent');

		const expiresIn = parseTimeString(durationString);
		if (durationString && isNullish(expiresIn)) {
			return interaction.errorReply('Invalid time format');
		}

		const expiresAt = isNullish(expiresIn) ? undefined : expiresIn + Date.now();

		return new ModerationAction(settings, interaction.member) //
			.mute(member, { reason, sendDm, silent, duration: expiresAt });
	}
}
