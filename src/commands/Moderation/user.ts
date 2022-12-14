import { getUserInfo } from '#utils/util';
import { getGuildIds } from '#utils/config';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { ModerationModule } from '../../modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Get info on the selected user or provided ID.',
	detailedDescription:
		'Displays all the info about a user such as: creation date, join date, if they are in the server, if they are banned (and ban reason if applicable).',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
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
					.setName('user')
					.setDescription(this.description)
					.addUserOption((option) =>
						option //
							.setName('target')
							.setDescription('Select a user or provide ID')
							.setRequired(true)
					),
			{ idHints: ['1035784234377416734', '1035810694530084915'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const embed = await getUserInfo(interaction, interaction.options.getUser('target', true).id);
		return interaction.editReply({ embeds: [embed] });
	}
}
