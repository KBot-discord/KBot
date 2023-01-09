import { getGuildIds } from '#utils/config';
import { ModerationAction } from '#lib/structures/ModerationAction';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { GuildMember } from 'discord.js';
import type { ModerationModule } from '../../modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Kick the target member.',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
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
					.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
					.setName('kick')
					.setDescription('Kick the target member')

					.addUserOption((option) =>
						option //
							.setName('user')
							.setDescription('Select a user or provide an ID to kick. User must be in the server')
							.setRequired(true)
					)
					.addStringOption((option) =>
						option //
							.setName('reason')
							.setDescription('Reason for the kick')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option //
							.setName('dm')
							.setDescription('DM the user the kick reason')
							.setRequired(false)
					)
					.addBooleanOption((option) =>
						option
							.setName('silent')
							.setDescription('True: kick will not show in logs, False: kick will show in logs. (default: false)')
							.setRequired(false)
					),
			{ idHints: ['1059975983286988892'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const settings = await this.module.service.repo.getSettings(interaction.guildId!);

		const member = await interaction.guild!.members.fetch(interaction.options.getUser('user', true).id);

		const reason = interaction.options.getString('reason') ?? undefined;
		const dm = interaction.options.getBoolean('dm') ?? undefined;
		const silent = interaction.options.getBoolean('silent') ?? undefined;

		return new ModerationAction(settings!, interaction.member as GuildMember, member).kick({ reason, dm, silent });
	}
}
