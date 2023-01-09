import { getGuildIds } from '#utils/config';
import { EmbedColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { ModerationModule } from '../../modules/ModerationModule';
import type { ModerationModule as ModuleConfig } from '@prisma/client';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Minimum account age',
	preconditions: ['GuildOnly', 'ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class ModerationCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('minage')
					.setDescription('Have accounts under a certain age kicked')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set the channel to send notifications to')
							.addIntegerOption((option) =>
								option //
									.setName('days')
									.setDescription('New users below the set age will be kicked and sent a message')
							)
							.addStringOption((msg) =>
								msg //
									.setName('response')
									.setDescription('Message to be sent on kick')
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset the current configuration')
							.addBooleanOption((msg) =>
								msg //
									.setName('days')
									.setDescription('Reset the required days to 0')
							)
							.addBooleanOption((msg) =>
								msg //
									.setName('response')
									.setDescription('Reset the kick message to default')
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('config')
							.setDescription('Show the current config')
					),
			{ idHints: ['1041955417888145460'], guildIds: getGuildIds() }
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
		const { db } = this.container;

		const days = interaction.options.getInteger('days');
		const response = interaction.options.getString('response');

		const newModule = await db.$transaction(async (prisma) => {
			const res = await prisma.moderationModule.findUnique({
				where: {
					id: interaction.guildId!
				}
			});
			return prisma.moderationModule.update({
				where: { id: interaction.guildId! },
				data: {
					minAccountAgeReq: days ?? res?.minAccountAgeReq,
					minAccountAgeMsg: response ?? res?.minAccountAgeMsg
				}
			});
		});

		return this.showConfig(interaction, newModule);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const days = interaction.options.getBoolean('days');
		const response = interaction.options.getBoolean('response');

		const newModule = await db.$transaction(async (prisma) => {
			const res = await prisma.moderationModule.findUnique({
				where: {
					id: interaction.guildId!
				}
			});
			return prisma.moderationModule.update({
				where: { id: interaction.guildId! },
				data: {
					minAccountAgeReq: days ? 0 : res?.minAccountAgeReq,
					minAccountAgeMsg: response ? null : res?.minAccountAgeMsg
				}
			});
		});

		return this.showConfig(interaction, newModule);
	}

	public async chatInputConfig(interaction: ModuleCommand.ChatInputCommandInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const module = await db.moderationModule.findUnique({
			where: {
				id: interaction.guildId!
			}
		});

		return this.showConfig(interaction, module);
	}

	private showConfig(interaction: ModuleCommand.ChatInputCommandInteraction, config: ModuleConfig | null) {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Discord status config', iconURL: interaction.guild!.iconURL()! })
					.setDescription(`Channel: ${config?.minAccountAgeReq ? config.minAccountAgeReq : 'No requirement set'}`)
			]
		});
	}
}
