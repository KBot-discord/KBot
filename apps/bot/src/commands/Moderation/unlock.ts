import { EmbedColors, Emoji } from '#utils/constants';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { GuildTextBasedChannel, ApplicationCommandOptionChoiceData } from 'discord.js';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommandOptions>({
	module: 'ModerationModule',
	description: 'Unlock a channel.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Unlock')
			.setDescription('Unlock a channel.')
			.setOptions({ label: '/unlock [channel]' });
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
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

	public override async autocompleteRun(interaction: ModuleCommand.AutocompleteInteraction<'cached'>): Promise<void> {
		const lockedChannelEntries = await this.module.lockedChannels.getByGuild({ guildId: interaction.guildId });
		if (lockedChannelEntries.length === 0) return interaction.respond([]);

		const channelData = await Promise.all(lockedChannelEntries.map(({ id }) => interaction.guild.channels.fetch(id)));

		const channelOptions: ApplicationCommandOptionChoiceData[] = channelData //
			.filter((e) => !isNullish(e))
			.map((channel) => ({ name: channel!.name, value: channel!.id }));

		return interaction.respond(channelOptions);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { lockedChannels } = this.module;
		const { validator } = this.container;

		const channelId = interaction.options.getString('channel') ?? interaction.channelId!;
		const channel = (await interaction.guild.channels.fetch(channelId)) as GuildTextBasedChannel | null;
		if (isNullish(channel)) {
			await lockedChannels.delete({ discordChannelId: channelId });
			return interaction.errorReply('That channel does not exist.');
		}

		/*
		if (channel.isThread() && isNullish(channel.parentId)) {
			return interaction.errorReply(`I'm not able to unlock ${channel.name}`);
		}
		 */

		const existingLock = await lockedChannels.get({ discordChannelId: channel.id });
		if (isNullish(existingLock)) {
			return interaction.errorReply(`${channel.name} is already unlocked.`);
		}

		const { result } = await validator.channels.canSendEmbeds(channel);
		if (channel.id !== interaction.channel!.id && result) {
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

		await lockedChannels.setChannelMessagePermissions(channel, existingLock.roleId, existingLock.oldValue);

		await lockedChannels.delete({ discordChannelId: channel.id });

		if (!isNullish(existingLock.duration)) {
			lockedChannels.deleteTask(channel.id);
		}
	}
}
