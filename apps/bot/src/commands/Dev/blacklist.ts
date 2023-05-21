import { KBotErrors } from '#types/Enums';
import { MissingSubcommandHandlerError } from '#structures/errors/MissingSubcommandHandlerError';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Manage the guild blacklist',
	preconditions: ['BotOwnerOnly'],
	runIn: ['GUILD_ANY']
})
export class DevCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry): void {
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

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		await interaction.deferReply();

		switch (interaction.options.getSubcommand(true)) {
			case 'add':
				return this.chatInputAdd(interaction);
			case 'remove':
				return this.chatInputRemove(interaction);
			case 'is_blacklisted':
				return this.chatInputIsBlacklisted(interaction);
			default:
				return interaction.client.emit(KBotErrors.MissingSubcommandHandler, {
					interaction,
					error: new MissingSubcommandHandlerError({ command: this })
				});
		}
	}

	public async chatInputAdd(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
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

		return interaction.defaultReply(`${guildId} added to the blacklist.`);
	}

	public async chatInputRemove(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const guildId = interaction.options.getString('guild', true);

		await this.container.prisma.blacklist
			.delete({
				where: { guildId }
			})
			.catch(() => null);

		return interaction.defaultReply(`${guildId} added to the blacklist.`);
	}

	public async chatInputIsBlacklisted(interaction: Command.ChatInputCommandInteraction<'cached'>): Promise<unknown> {
		const guildId = interaction.options.getString('guild', true);

		const result = await this.container.prisma.blacklist.count({
			where: { guildId }
		});

		if (result > 1) {
			return interaction.defaultReply(`${guildId} is blacklisted.`);
		}

		return interaction.defaultReply(`${guildId} is not blacklisted.`);
	}
}
