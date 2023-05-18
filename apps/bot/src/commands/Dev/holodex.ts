import { KBotErrors } from '#types/Enums';
import { EmbedColors } from '#utils/constants';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Manage the Holodex Twitch conflict list',
	preconditions: ['BotOwner']
})
export class DevCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: Command.Registry): void {
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

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'add_conflict': {
				return this.chatInputAddConflict(interaction);
			}
			case 'remove_conflict': {
				return this.chatInputRemoveConflict(interaction);
			}
			case 'conflict_list': {
				return this.chatInputConflictList(interaction);
			}
			default: {
				return interaction.client.emit(KBotErrors.UnknownCommand, { interaction });
			}
		}
	}

	public async chatInputAddConflict(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const channelId = interaction.options.getString('channel', true);

		await this.container.prisma.twitchConflict.upsert({
			where: { channelId },
			update: { channelId },
			create: { channelId }
		});

		return interaction.defaultReply(`${channelId} will be filtered out.`);
	}

	public async chatInputRemoveConflict(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const channelId = interaction.options.getString('channel', true);

		await this.container.prisma.twitchConflict
			.delete({
				where: { channelId }
			})
			.catch(() => null);

		return interaction.defaultReply(`${channelId} added to the blacklist.`);
	}

	public async chatInputConflictList(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const result = await this.container.prisma.twitchConflict.findMany();

		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setTitle('The following channels are filtered out')
			.setDescription(result.map(({ channelId }) => channelId).toString());

		return interaction.editReply({ embeds: [embed] });
	}
}
