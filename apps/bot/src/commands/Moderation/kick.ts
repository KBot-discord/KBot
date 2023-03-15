import { ModerationAction } from '#structures/ModerationAction';
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
	description: 'Kick a user.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Kick')
			.setDescription('Kick a user.')
			.setOptions({ label: '/ban <user> [reason] [dm] [silent]' });
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
					.setName('kick')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user or provide an ID to kick')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('The reason for the kick. (default: "No reason provided.")')
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
							.setDescription('True: kick will not show in logs, False: kick will show in logs. (default: false)')
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

		const { result, error } = moderation.canKickTarget(interaction.member, member);
		if (!result) {
			return interaction.client.emit(KBotErrors.ModerationPermissions, { interaction, error });
		}

		const settings = await this.module.getSettings(interaction.guildId);
		if (isNullish(settings)) {
			return interaction.errorReply("Something went wrong when fetching this server's settings.");
		}

		const reason = interaction.options.getString('reason');
		const sendDm = interaction.options.getBoolean('dm');
		const silent = interaction.options.getBoolean('silent');

		await new ModerationAction(settings, interaction.member) //
			.kick(member, { reason, sendDm, silent });

		return interaction.defaultReply(`**${member.user.tag}** has been kicked.`);
	}
}