import { EmbedColors } from '#utils/constants';
import { KBotErrors } from '#types/Enums';
import { getGuildIcon } from '#utils/Discord';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { GuildTextBasedChannel } from 'discord.js';
import type { UtilityModule } from '#modules/UtilityModule';
import type { UtilitySettings } from '#prisma';

@ApplyOptions<KBotCommandOptions>({
	module: 'UtilityModule',
	description: 'Send emote credits to a channel.',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Emote Credits')
			.setDescription('Send emote credits to a channel.')
			.setSubcommands([
				{ label: '/emotecredits add <emote>', description: 'Add a new emote credit' }, //
				{ label: '/emotecredits set <channel>', description: 'Set a new emote credits channel' },
				{ label: '/emotecredits unset', description: 'Reset the emote credits channel' },
				{ label: '/emotecredits settings', description: 'Show the current settings' }
			]);
	}
})
export class UtilityCommand extends KBotCommand<UtilityModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('emotecredits')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('add')
							.setDescription('Add a new emote credit')
							.addStringOption((option) =>
								option //
									.setName('emote')
									.setDescription('The ID of the emote to add credits for')
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set a new emote credits channel')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send emote credits to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Reset the emote credits channel')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('settings')
							.setDescription('Show the current settings')
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const subcommand = interaction.options.getSubcommand(true);

		if (subcommand !== 'add') {
			await interaction.deferReply();
		}

		switch (subcommand) {
			case 'add': {
				return this.chatInputAdd(interaction);
			}
			case 'set': {
				return this.chatInputSet(interaction);
			}
			case 'unset': {
				return this.chatInputUnset(interaction);
			}
			case 'settings': {
				return this.chatInputSettings(interaction);
			}
			default: {
				this.container.logger.fatal(`[${this.name}] Hit default switch in`);
				return interaction.errorReply('Something went wrong.');
			}
		}
	}

	public async chatInputAdd(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const emoteId = interaction.options.getString('emote', true);
		const settings = await this.module.getSettings(interaction.guildId);

		if (!settings || !settings.creditsChannelId) {
			return interaction.errorReply('There is no emote credits channel set.');
		}

		const emoji = interaction.guild.emojis.cache.get(emoteId);
		if (!emoji) {
			return interaction.defaultReply('An emote with that ID does not exist.', true);
		}

		const modal = this.module.buildEmoteCreditModal(settings.creditsChannelId, emoji.id);
		return interaction.showModal(modal);
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { client, validator } = this.container;
		const channel = interaction.options.getChannel('channel', true) as GuildTextBasedChannel;

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const settings = await this.module.upsertSettings(interaction.guildId, {
			creditsChannelId: channel.id
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.upsertSettings(interaction.guildId, {
			creditsChannelId: null
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, settings: UtilitySettings | null) {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Emote credits settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`Channel: ${settings?.creditsChannelId ? channelMention(settings.creditsChannelId) : 'No channel set'}`)
			]
		});
	}
}
