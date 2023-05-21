import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import type { ModuleCommand } from '@kbotdev/plugin-modules';

@ApplyOptions<Command.Options>({
	description: 'Sync the channels from Holodex',
	preconditions: ['BotOwnerOnly'],
	runIn: ['GUILD_ANY'],
	cooldownDelay: Time.Minute * 5,
	cooldownLimit: 1
})
export class DevCommand extends Command {
	public override registerApplicationCommands(registry: ModuleCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('dev_youtubesync')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public override async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		await this.container.tasks.create('holodexSync', {}, { repeated: false, delay: 0 });
		return interaction.reply(`Holodex sync started.`);
	}
}
