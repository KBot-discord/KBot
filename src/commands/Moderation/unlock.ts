import { EmbedColors, Emoji } from '#utils/constants';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { GuildTextBasedChannel } from 'discord.js';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'ModerationModule',
	description: 'Unlock a channel.',
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
					.setName('unlock')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
					.setDMPermission(false)
					.addStringOption((option) =>
						option //
							.setName('channel')
							.setDescription('The channel to unlock. (default: this channel)')
							.setAutocomplete(true)
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

		const channelId = interaction.options.getString('channel') ?? interaction.channelId!;
		const channel = (await interaction.guild.channels.fetch(channelId)) as GuildTextBasedChannel | null;
		if (isNullish(channel)) {
			await lockedChannels.delete(channelId);
			return interaction.errorReply('That channel does not exist.');
		}

		/*
		if (channel.isThread() && isNullish(channel.parentId)) {
			return interaction.errorReply(`I'm not able to unlock ${channel.name}`);
		}
		 */

		const existingLock = await lockedChannels.fetch(channel.id);
		if (isNullish(existingLock)) {
			return interaction.errorReply(`${channel.name} is already unlocked.`);
		}

		if (channel.id !== interaction.channel!.id) {
			await channel.send({
				embeds: [
					new EmbedBuilder() //
						.setColor(EmbedColors.Default)
						.setTitle(`${Emoji.Locked} ${channel.name} has been unlocked`)
				]
			});
		}

		await interaction.editReply({
			embeds: [
				new EmbedBuilder() //
					.setColor(EmbedColors.Default)
					.setTitle(`${Emoji.Locked} ${channel.name} has been unlocked`)
			]
		});

		await lockedChannels.setChannelMessagePermissions(channel, existingLock.roleId, null);

		await lockedChannels.delete(channel.id);

		if (!isNullish(existingLock.duration)) {
			await lockedChannels.deleteTask(channel.id);
		}
	}
}
