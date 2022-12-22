import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { ModerationModule } from '../../modules/ModerationModule';
import type { ChatInputCommand, ContextMenuCommand } from '@sapphire/framework';

@ApplyOptions<ChatInputCommand.Options>({
	detailedDescription: 'Send the selected message to the set moderator channel.',
	preconditions: ['GuildOnly', 'ModuleEnabled']
})
export class KBotCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('report')
					.setType(ApplicationCommandType.Message),
			{ idHints: ['1041955416713723924'], guildIds: getGuildIds() }
		);
	}

	public async contextMenuRun(interaction: ContextMenuCommand.Interaction) {
		await interaction.deferReply({ ephemeral: true });
		return interaction.defaultReply('reported');
	}
}
