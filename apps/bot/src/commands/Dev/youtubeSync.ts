import { KBotModules } from '#lib/types/Enums';
import { KBotCommand } from '#lib/extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import { PermissionFlagsBits } from 'discord.js';
import type { DevModule } from '#modules/DevModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Dev,
	description: 'Sync the channels from Holodex',
	preconditions: ['BotOwnerOnly'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	cooldownDelay: Time.Minute * 5,
	cooldownLimit: 1,
	helpEmbed: (builder) => {
		return builder //
			.setName('dev_setflags');
	}
})
export class DevCommand extends KBotCommand<DevModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await this.container.tasks.create('holodexSync', { repeated: false, delay: 0 });
		return interaction.reply(`Holodex sync started.`);
	}
}
