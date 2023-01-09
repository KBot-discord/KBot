import { getGuildIds } from '#utils/config';
import { KaraokeEventMenu } from '#lib/structures/KaraokeEventMenu';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { UtilityModule } from '../../modules/UtilityModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'UtilityModule',
	description: 'Event module',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class UtilityCommand extends ModuleCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		return this.chatInputKaraoke(interaction);
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('event')
					.setDescription('Event module')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('karaoke')
							.setDescription('Open the karaoke menu')
					),
			{ idHints: ['1038259859797323856'], guildIds: getGuildIds() }
		);
	}

	public async chatInputKaraoke(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		return new KaraokeEventMenu(interaction.guild!).run(interaction);
	}
}
