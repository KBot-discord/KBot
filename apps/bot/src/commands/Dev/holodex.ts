import { KBotModules } from '#types/Enums';
import { EmbedColors } from '#utils/constants';
import { KBotSubcommand } from '#extensions/KBotSubcommand';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { DevModule } from '#modules/DevModule';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Dev,
	description: 'Manage the Holodex Twitch conflict list',
	preconditions: ['BotOwnerOnly', 'Defer'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('dev_holodex');
	},
	subcommands: [
		{ name: 'add_conflict', chatInputRun: 'chatInputAddConflict' },
		{ name: 'remove_conflict', chatInputRun: 'chatInputRemoveConflict' },
		{ name: 'conflict_list', chatInputRun: 'chatInputConflictList' }
	]
})
export class DevCommand extends KBotSubcommand<DevModule> {
	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('dev_holodex')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('add_conflict')
							.setDescription('Add a conflict entry')
							.addStringOption((option) =>
								option //
									.setName('channel')
									.setDescription('The ID of the channel')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('remove_conflict')
							.setDescription('Remove a conflict entry')
							.addStringOption((option) =>
								option //
									.setName('channel')
									.setDescription('The ID of the channel')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('conflict_list')
							.setDescription('Check the Twitch conflict list')
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputAddConflict(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const channelId = interaction.options.getString('channel', true);

		await this.container.prisma.twitchConflict.upsert({
			where: { channelId },
			update: { channelId },
			create: { channelId }
		});

		return interaction.defaultReply(`${channelId} will be filtered out.`);
	}

	public async chatInputRemoveConflict(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const channelId = interaction.options.getString('channel', true);

		await this.container.prisma.twitchConflict
			.delete({
				where: { channelId }
			})
			.catch(() => null);

		return interaction.defaultReply(`${channelId} added to the blacklist.`);
	}

	public async chatInputConflictList(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const result = await this.container.prisma.twitchConflict.findMany();

		const description: string =
			result.length > 0 //
				? result.map(({ channelId }) => channelId).toString()
				: 'No entries to list';

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setTitle('The following channels are filtered out:')
			.setDescription(description);

		return interaction.editReply({ embeds: [embed] });
	}
}
