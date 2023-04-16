import { EmbedColors } from '#utils/constants';
import { KBotErrors } from '#types/Enums';
import { getGuildIcon } from '#utils/Discord';
import { KBotCommand, type KBotCommandOptions } from '#extensions/KBotCommand';
import { CreditType } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';
import { channelMention } from '@discordjs/builders';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import Fuse from 'fuse.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildTextBasedChannel, GuildEmoji, Sticker, ApplicationCommandOptionChoiceData } from 'discord.js';
import type { UtilityModule } from '#modules/UtilityModule';
import type { UtilitySettings } from '#prisma';

@ApplyOptions<KBotCommandOptions>({
	module: 'UtilityModule',
	description: 'Send credits to a channel.',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Credits')
			.setDescription('Send credits to a channel.')
			.setSubcommands([
				{ label: '/credits emote <name>', description: 'Add a new emote credit entry' }, //
				{ label: '/credits sticker <name>', description: 'Add a new sticker credit entry' },
				{ label: '/credits image', description: 'Add a new image credit entry' },
				{ label: '/credits set <channel>', description: 'Set a new credits channel' },
				{ label: '/credits unset', description: 'Reset the credits channel' },
				{ label: '/credits settings', description: 'Show the current settings' }
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
					.setName('credits')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('emote')
							.setDescription('Add a new emote credit entry')
							.addStringOption((option) =>
								option //
									.setName('name')
									.setDescription('The name of the emote to add credits for')
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('sticker')
							.setDescription('Add a new sticker credit entry')
							.addStringOption((option) =>
								option //
									.setName('name')
									.setDescription('The name of the sticker to add credits for')
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('image')
							.setDescription('Add a new image credit entry')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set a new emote channel')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send credits to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(true)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Reset the credits channel')
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

	public override async autocompleteRun(interaction: ModuleCommand.AutocompleteInteraction<'cached'>): Promise<void> {
		const subcommand = interaction.options.getSubcommand(true);
		const search = interaction.options.getString('name', true);

		let cachedData: (GuildEmoji | Sticker)[];

		if (subcommand === 'emote') {
			cachedData = interaction.guild.emojis.cache.toJSON();
		} else {
			cachedData = interaction.guild.stickers.cache.toJSON();
		}

		const fuzzy = new Fuse(
			cachedData.filter(({ name }) => !isNullish(name)),
			{
				keys: [
					{ name: 'name', weight: 0.8 },
					{ name: 'id', weight: 1 }
				]
			}
		);

		const options: ApplicationCommandOptionChoiceData[] =
			search === ''
				? cachedData.map(({ id, name }) => ({ name: `${name!} (ID: ${id})`, value: id }))
				: fuzzy.search(search).map(({ item }) => ({ name: `${item.name!} (ID: ${item.id})`, value: item.id }));

		return interaction.respond(options.slice(0, 24));
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case 'emote': {
				return this.chatInputEmote(interaction);
			}
			case 'sticker': {
				return this.chatInputSticker(interaction);
			}
			case 'image': {
				return this.chatInputImage(interaction);
			}
			case 'set': {
				await interaction.deferReply();
				return this.chatInputSet(interaction);
			}
			case 'unset': {
				await interaction.deferReply();
				return this.chatInputUnset(interaction);
			}
			case 'settings': {
				await interaction.deferReply();
				return this.chatInputSettings(interaction);
			}
			default: {
				return interaction.client.emit(KBotErrors.UnknownCommand, { interaction });
			}
		}
	}

	public async chatInputEmote(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const emoteId = interaction.options.getString('name', true);
		const settings = await this.module.getSettings(interaction.guildId);

		if (!settings || !settings.creditsChannelId) {
			return interaction.errorReply('There is no credits channel set.');
		}

		const emoji = interaction.guild.emojis.cache.get(emoteId);
		if (!emoji) {
			return interaction.defaultReply('An emote with that ID does not exist.', true);
		}

		const modal = this.module.buildCreditModal(settings.creditsChannelId, emoji.id, CreditType.Emote);
		return interaction.showModal(modal);
	}

	public async chatInputSticker(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const emoteId = interaction.options.getString('name', true);
		const settings = await this.module.getSettings(interaction.guildId);

		if (!settings || !settings.creditsChannelId) {
			return interaction.errorReply('There is no credits channel set.');
		}

		const sticker = interaction.guild.stickers.cache.get(emoteId);
		if (!sticker) {
			return interaction.defaultReply('A sticker with that ID does not exist.', true);
		}

		const modal = this.module.buildCreditModal(settings.creditsChannelId, sticker.id, CreditType.Sticker);
		return interaction.showModal(modal);
	}

	public async chatInputImage(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		if (!settings || !settings.creditsChannelId) {
			return interaction.errorReply('There is no credits channel set.');
		}

		const modal = this.module.buildCreditModal(settings.creditsChannelId);
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
					.setAuthor({ name: 'Credit settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`Channel: ${settings?.creditsChannelId ? channelMention(settings.creditsChannelId) : 'No channel set'}`)
			]
		});
	}
}
