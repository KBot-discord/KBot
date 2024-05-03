import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import type { DevModule } from '../../modules/DevModule.js';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Dev,
	description: 'Manage the guild blacklist',
	preconditions: ['BotOwnerOnly', 'Defer'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('dev_blacklist');
	},
	subcommands: [
		{ name: 'add', chatInputRun: 'chatInputAdd' },
		{ name: 'remove', chatInputRun: 'chatInputRemove' },
		{ name: 'is_blacklisted', chatInputRun: 'chatInputIsBlacklisted' }
	]
})
export class DevCommand extends KBotSubcommand<DevModule> {
	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('dev_blacklist')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('add')
							.setDescription('Add a guild to blacklist')
							.addStringOption((option) =>
								option //
									.setName('guild')
									.setDescription('The ID of the guild')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('remove')
							.setDescription('Remove a guild blacklist')
							.addStringOption((option) =>
								option //
									.setName('guild')
									.setDescription('The ID of the guild')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('is_blacklisted')
							.setDescription('Check if a guild is blacklisted')
							.addStringOption((option) =>
								option //
									.setName('guild')
									.setDescription('The ID of the guild')
									.setRequired(true)
							)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputAdd(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const guildId = interaction.options.getString('guild', true);

		await this.container.prisma.blacklist.upsert({
			where: { guildId },
			update: { guildId },
			create: { guildId }
		});

		const guild = interaction.client.guilds.cache.get(guildId);
		if (guild) {
			await guild.leave();
		}

		return await interaction.defaultReply(`${guildId} added to the blacklist.`);
	}

	public async chatInputRemove(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const guildId = interaction.options.getString('guild', true);

		await this.container.prisma.blacklist
			.delete({
				where: { guildId }
			})
			.catch(() => null);

		return await interaction.defaultReply(`${guildId} added to the blacklist.`);
	}

	public async chatInputIsBlacklisted(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const guildId = interaction.options.getString('guild', true);

		const result = await this.container.prisma.blacklist.count({
			where: { guildId }
		});

		if (result > 1) {
			return await interaction.defaultReply(`${guildId} is blacklisted.`);
		}

		return await interaction.defaultReply(`${guildId} is not blacklisted.`);
	}
}
