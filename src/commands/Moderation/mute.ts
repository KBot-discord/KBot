import { getGuildIds } from '#utils/config';
import { ModerationAction } from '#lib/structures/ModerationAction';
import { parseTimeString } from '#utils/util';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { GuildMember } from 'discord.js';
import type { ModerationModule } from '../../modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Mute the selected user for the provided amount of time.',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class ModerationCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
					.setName('mute')
					.setDescription('Mute the selected user for the provided amount of time')
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user or provide an ID to mute')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('duration')
							.setDescription('Amount to mute for. Cannot set longer than 30 days. Format is 1d2h3m (days, hours, minutes)')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('Reason to DM the user')
							.setRequired(true)
					)
					.addBooleanOption((option) =>
						option //
							.setName('silent')
							.setDescription('True: mute will not show in logs, False: mute will show in logs. (default: false)')
							.setRequired(false)
					),
			{ idHints: ['1059975981034651749'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const settings = await this.module.service.repo.getSettings(interaction.guildId!);

		const member = await interaction.guild!.members.fetch(interaction.options.getUser('user', true).id);

		const durationString = interaction.options.getString('duration');
		const reason = interaction.options.getString('reason') ?? undefined;
		const silent = interaction.options.getBoolean('silent') ?? undefined;

		const expiresIn = parseTimeString(durationString);
		if (durationString && !expiresIn) {
			return interaction.errorReply('Invalid time format');
		}

		const expiresAt = expiresIn ? expiresIn + Date.now() : undefined;

		return new ModerationAction(settings!, interaction.member as GuildMember, member).mute({ reason, silent, time: expiresAt });
	}
}
