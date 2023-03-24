import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { Command } from '@sapphire/framework';
import { Time } from '@sapphire/duration';

@ApplyOptions<Command.Options>({
	description: 'Sync the channels from Holodex',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages],
	preconditions: ['BotOwner'],
	cooldownDelay: Time.Minute * 5,
	cooldownLimit: 1
})
export class YoutubeCommand extends Command {
	public constructor(context: ModuleCommand.Context, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('youtubesync')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		this.container.tasks.create('holodexSync', {}, { repeated: false, delay: 0 });
		return interaction.reply(`Holodex sync started.`);
	}
}