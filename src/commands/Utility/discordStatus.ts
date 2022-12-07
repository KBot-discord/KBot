import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { ChannelType } from 'discord-api-types/v10';
import { GuildChannel, MessageEmbed } from 'discord.js';
import { EmbedColors } from '../../lib/util/constants';
import { channelMention } from '@discordjs/builders';
import type { UtilityModule } from '@prisma/client';

@ApplyOptions<Subcommand.Options>({
	description: 'Discord status',
	preconditions: ['GuildOnly'],
	subcommands: [
		{ name: 'set', chatInputRun: 'chatInputSet' },
		{ name: 'unset', chatInputRun: 'chatInputUnset' },
		{ name: 'config', chatInputRun: 'chatInputConfig' }
	]
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

	public async chatInputSet(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db, channels } = this.container;
		const channel = interaction.options.getChannel('channel', true) as GuildChannel;

		const { valid, errors } = channels.canSendEmbeds(channel);
		if (!valid) {
			return interaction.errorReply(
				`I don't have the required permission(s) to send tweets in <#${channel.id}>\n\nRequired permission(s):${errors}`
			);
		}

		const config = await db.utilityModule
			.update({
				where: { id: interaction.guildId! },
				data: { incidentChannel: channel.id }
			})
			.catch(() => null);
		return this.showConfig(interaction, config);
	}

	public async chatInputUnset(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const config = await db.utilityModule
			.update({
				where: { id: interaction.guildId! },
				data: { incidentChannel: null }
			})
			.catch(() => null);

		return this.showConfig(interaction, config);
	}

	public async chatInputConfig(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const config = await db.utilityModule
			.findUnique({
				where: { id: interaction.guildId! }
			})
			.catch(() => null);

		return this.showConfig(interaction, config);
	}

	private showConfig(interaction: Subcommand.ChatInputInteraction, config: UtilityModule | null) {
		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Discord status config', iconURL: interaction.guild!.iconURL()! })
					.setDescription(`Channel: ${config?.incidentChannel ? channelMention(config.incidentChannel) : 'No channel set'}`)
			]
		});
	}
}
