import { parseTimeString } from '#utils/functions';
import { EmbedColors, Emoji } from '#utils/constants';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { GuildTextBasedChannel } from 'discord.js';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Lock a channel.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: {
		defer: true
	}
})
export class ModerationCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('lock')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
					.setDMPermission(false)
					.addRoleOption((option) =>
						option //
							.setName('role')
							.setDescription('The role to lock the channel for. (default: everyone)')
							.setRequired(false)
					)
					.addChannelOption((option) =>
						option //
							.setName('channel')
							.setDescription('The channel to lock. (default: this channel)')
							.addChannelTypes(
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
								ChannelType.PublicThread,
								ChannelType.PrivateThread,
								ChannelType.GuildForum
							)
							.setRequired(false)
					)
					.addStringOption((option) =>
						option //
							.setName('duration')
							.setDescription('Amount of time to lock for. (default: indefinite)')
							.setRequired(false)
					)
					.addStringOption((message) =>
						message //
							.setName('text')
							.setDescription('The text to send when the channel is locked. (default: no message)')
							.setRequired(false)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { lockedChannels } = this.module;

		const role = interaction.options.getRole('role') ?? interaction.guild.roles.everyone;
		const channel = (interaction.options.getChannel('channel') as GuildTextBasedChannel | null) ?? interaction.channel!;
		const durationString = interaction.options.getString('duration');
		const text = interaction.options.getString('text');

		/*
		if (channel.isThread() && isNullish(channel.parentId)) {
			return interaction.errorReply(`I'm not able to lock ${channel.name}`);
		}
		 */

		const existingLock = await lockedChannels.get({ discordChannelId: channel.id });
		if (!isNullish(existingLock)) {
			return interaction.errorReply(`${channel.name} is already locked.`);
		}

		const expiresIn = parseTimeString(durationString);
		if (!isNullish(durationString) && isNullish(expiresIn)) {
			return interaction.errorReply('Invalid time format');
		}

		const expiresAt = expiresIn ? expiresIn + Date.now() : undefined;

		const embed = new EmbedBuilder().setColor(EmbedColors.Default);
		if (text || expiresAt) {
			embed.setDescription(`${expiresAt ? `**Unlocks in: **<t:${Math.floor(expiresAt / 1000)}:R>` : ''}${text ? `\n\n${text}` : ''}`);
		}

		if (channel.id !== interaction.channel!.id) {
			await channel.send({
				embeds: [embed.setTitle(`${Emoji.Locked} ${channel.name} has been locked`)]
			});
		}

		await interaction.editReply({
			embeds: [embed.setTitle(`${Emoji.Locked} ${channel.name} has been locked`)]
		});

		await lockedChannels.setChannelMessagePermissions(channel, role.id, false);

		await lockedChannels.create({
			id: channel.id,
			guildId: interaction.guildId,
			roleId: role.id,
			duration: expiresAt ? BigInt(expiresAt) : undefined
		});
		if (expiresAt) {
			await lockedChannels.createTask(expiresIn!, { channelId: channel.id });
		}
	}
}
