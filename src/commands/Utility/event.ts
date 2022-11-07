// Imports
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds, getIdHints } from '../../lib/util/config';
import { KaraokeEventMenu } from '../../lib/structures/KaraokeEventMenu';

@ApplyOptions<Subcommand.Options>({
	description: 'Event module',
	subcommands: [{ name: 'karaoke', chatInputRun: 'chatInputKaraoke' }]
})
export class EventCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
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
			{ idHints: getIdHints(this.name), guildIds: getGuildIds() }
		);
	}

	public async chatInputKaraoke(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply({ ephemeral: true });
		return new KaraokeEventMenu(interaction).build();
	}
}
