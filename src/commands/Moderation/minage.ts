import { getGuildIds } from '#utils/config';
import { EmbedColors } from '#utils/constants';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { ModerationModule } from '@prisma/client';

@ApplyOptions<Subcommand.Options>({
	description: 'Minimum account age',
	subcommands: [
		{ name: 'set', chatInputRun: 'chatInputSet' },
		{ name: 'unset', chatInputRun: 'chatInputUnset' },
		{ name: 'config', chatInputRun: 'chatInputConfig' }
	],
	preconditions: ['GuildOnly'],
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
})
export class DiscordStatusCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
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

	public async chatInputSet(interaction: Subcommand.ChatInputInteraction) {
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

	public async chatInputUnset(interaction: Subcommand.ChatInputInteraction) {
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

	public async chatInputConfig(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const module = await db.moderationModule.findUnique({
			where: {
				id: interaction.guildId!
			}
		});

		return this.showConfig(interaction, module);
	}

	private showConfig(interaction: Subcommand.ChatInputInteraction, config: ModerationModule | null) {
		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Discord status config', iconURL: interaction.guild!.iconURL()! })
					.setDescription(`Channel: ${config?.minAccountAgeReq ? config.minAccountAgeReq : 'No requirement set'}`)
			]
		});
	}
}
