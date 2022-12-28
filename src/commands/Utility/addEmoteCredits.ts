import { getGuildIds } from '#utils/config';
import { EmbedColors, KBotErrors } from '#utils/constants';
import { KBotError } from '#lib/structures/KBotError';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { GuildChannel, MessageEmbed } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import type { UtilityModule } from '@prisma/client';

@ApplyOptions<Subcommand.Options>({
	description: 'Add emote credits',
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
					.setName('addemote')
					.setDescription('Configure what channel to send emote credits to')
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set the channel to send credits to')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('Select a channel to send the credits in')
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
			{ idHints: [], guildIds: getGuildIds() }
		);
	}

	public async chatInputSet(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { client, db, validator } = this.container;
		const channel = interaction.options.getChannel('channel', true) as GuildChannel;

		const { valid, errors } = validator.channels.canSendEmbeds(channel);
		if (!valid) {
			const error = new KBotError({
				identifier: KBotErrors.ChannelPermissions,
				message: `I don't have the required permission(s) to send credits in <#${channel.id}>\n\nRequired permission(s):${errors}`
			});
			return client.emitError(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const config = await db.utilityModule
			.update({
				where: { id: interaction.guildId! },
				data: { creditsChannel: channel.id }
			})
			.catch((err) => {
				this.container.logger.error(err);
				return null;
			});
		return this.showConfig(interaction, config);
	}

	public async chatInputUnset(interaction: Subcommand.ChatInputInteraction) {
		await interaction.deferReply();
		const { db } = this.container;

		const config = await db.utilityModule
			.update({
				where: { id: interaction.guildId! },
				data: { creditsChannel: null }
			})
			.catch((err) => {
				this.container.logger.error(err);
				return null;
			});

		return this.showConfig(interaction, config);
	}

	public async chatInputConfig(interaction: Subcommand.ChatInputInteraction) {
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

	private showConfig(interaction: Subcommand.ChatInputInteraction, config: UtilityModule | null) {
		return interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Add emote config', iconURL: interaction.guild!.iconURL()! })
					.setDescription(`Channel: ${config?.creditsChannel ? channelMention(config.creditsChannel) : 'No channel set'}`)
			]
		});
	}
}
