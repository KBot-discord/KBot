import { EmbedColors, KBotErrors } from '#utils/constants';
import { getGuildIds } from '#utils/config';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildChannel, EmbedBuilder } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { UtilityModule } from '../../modules/UtilityModule';
import type { UtilityModule as UtilityConfig } from '@prisma/client';

@ApplyOptions<ModuleCommand.Options>({
	module: 'UtilityModule',
	description: 'Discord status',
	preconditions: ['ModuleEnabled', 'GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class UtilityCommand extends ModuleCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('discordstatus')
					.setDescription('Have notifications about Discord outages sent to a channel')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set the channel to send notifications to')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('Select a channel to send the message in')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset the current channel')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('config')
							.setDescription('Show the current config')
					),
			{ idHints: ['1040042392482496616'], guildIds: getGuildIds() }
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand(true)) {
			case 'set': {
				return this.chatInputSet(interaction);
			}
			case 'unset': {
				return this.chatInputUnset(interaction);
			}
			default: {
				return this.chatInputConfig(interaction);
			}
		}
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { client, db, validator } = this.container;
		const channel = interaction.options.getChannel('channel', true) as GuildChannel;

		const { result, error } = validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emitError(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const config = await db.utilityModule
			.upsert({
				where: {
					id: interaction.guildId!
				},
				update: {
					incidentChannel: channel.id
				},
				create: {
					incidentChannel: channel.id,
					guild: { connect: { id: interaction.guildId! } }
				}
			})
			.catch((err) => {
				this.container.logger.error(err);
				return null;
			});

		if (!config) return interaction.errorReply('Something went wrong.');
		return this.showConfig(interaction, config);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const config = await db.utilityModule
			.upsert({
				where: {
					id: interaction.guildId!
				},
				update: {
					incidentChannel: null
				},
				create: {
					incidentChannel: null,
					guild: { connect: { id: interaction.guildId! } }
				}
			})
			.catch((err) => {
				this.container.logger.error(err);
				return null;
			});

		if (!config) return interaction.errorReply('Something went wrong.');
		return this.showConfig(interaction, config);
	}

	public async chatInputConfig(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const config = await db.utilityModule
			.findUnique({
				where: { id: interaction.guildId! }
			})
			.catch((err) => {
				this.container.logger.error(err);
				return null;
			});

		return this.showConfig(interaction, config);
	}

	private showConfig(interaction: ModuleCommand.ChatInputCommandInteraction, config: UtilityConfig | null) {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Discord status config', iconURL: interaction.guild!.iconURL()! })
					.setDescription(`Channel: ${config?.incidentChannel ? channelMention(config.incidentChannel) : 'No channel set'}`)
			]
		});
	}
}
