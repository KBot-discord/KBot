import { getGuildIds } from '#utils/config';
import { ModerationAction } from '#lib/structures/ModerationAction';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { GuildMember } from 'discord.js';
import type { ModerationModule } from '../../modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Ban the target member.',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
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
					.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
					.setName('ban')
					.setDescription('Ban the target member')
					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user or provide an ID to ban')
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option //
							.setName('messages')
							.setDescription('Amount of messages to purge. (defaults to 1 day)')
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
							.setDescription('Reason for the ban')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('dm')
							.setDescription('DM the user the ban reason')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option
							.setName('silent')
							.setDescription('True: ban will not show in logs, False: ban will show in logs. (default: false)')
							.setRequired(false)
					),
			{ idHints: ['1059975984872427641'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const settings = await this.module.service.repo.getSettings(interaction.guildId!);

		const member = await interaction.guild!.members.fetch(interaction.options.getUser('user', true).id);

		const daysToPurge = interaction.options.getInteger('messages') ?? undefined;
		const reason = interaction.options.getString('reason') ?? undefined;
		const dm = interaction.options.getBoolean('dm') ?? undefined;
		const silent = interaction.options.getBoolean('silent') ?? undefined;

		return new ModerationAction(settings!, interaction.member as GuildMember, member).ban({ reason, dm, silent, daysToPurge });
	}
}
