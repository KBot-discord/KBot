import { channelMention } from '@discordjs/builders';
import type { UtilitySettings } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import type { ApplicationCommandOptionChoiceData, GuildEmoji, Sticker } from 'discord.js';
import fuzzysort from 'fuzzysort';
import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import { KBotErrors, KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { CreditType } from '../../lib/utilities/customIds.js';
import { getGuildIcon } from '../../lib/utilities/discord.js';
import type { UtilityModule } from '../../modules/UtilityModule.js';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Utility,
	description: 'Send credits to a channel.',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Credits')
			.setSubcommands([
				{ label: '/credits emote <name>', description: 'Add a new emote credit entry' }, //
				{ label: '/credits sticker <name>', description: 'Add a new sticker credit entry' },
				{ label: '/credits image', description: 'Add a new image credit entry' },
				{ label: '/credits set <channel>', description: 'Set a new credits channel' },
				{ label: '/credits unset', description: 'Reset the credits channel' },
				{ label: '/credits settings', description: 'Show the current settings' },
			]);
	},
	subcommands: [
		{ name: 'emote', chatInputRun: 'chatInputEmote' },
		{ name: 'sticker', chatInputRun: 'chatInputSticker' },
		{ name: 'image', chatInputRun: 'chatInputImage' },
		{ name: 'set', chatInputRun: 'chatInputSet' },
		{ name: 'unset', chatInputRun: 'chatInputUnset' },
		{ name: 'settings', chatInputRun: 'chatInputSettings' },
	],
})
export class UtilityCommand extends KBotSubcommand<UtilityModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/utility toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotSubcommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('credits')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
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
									.setRequired(true),
							),
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
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('image')
							.setDescription('Add a new image credit entry'),
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
									.setRequired(true),
							),
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Reset the credits channel'),
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('settings')
							.setDescription('Show the current settings'),
					),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public override async autocompleteRun(interaction: KBotSubcommand.AutocompleteInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand(true);
		const search = interaction.options.getString('name', true);

		let cachedData: (GuildEmoji | Sticker)[];

		if (subcommand === 'emote') {
			cachedData = interaction.guild.emojis.cache.toJSON();
		} else {
			cachedData = interaction.guild.stickers.cache.toJSON();
		}

		const result = fuzzysort.go(
			search,
			cachedData.filter(({ name }) => !isNullOrUndefined(name)),
			{
				limit: 25,
				all: true,
				keys: ['name', 'id'],
			},
		);

		const options: ApplicationCommandOptionChoiceData[] = result.map(({ obj }) => ({
			name: `${obj.name!} (ID: ${obj.id})`,
			value: obj.id,
		}));

		await interaction.respond(options.slice(0, 24));
	}

	public async chatInputEmote(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const emoteId = interaction.options.getString('name', true);
		const settings = await this.module.settings.get(interaction.guildId);

		if (!settings?.creditsChannelId) {
			return await interaction.defaultReply('There is no credits channel set. You can set one with `/credits set`');
		}

		const emoji = interaction.guild.emojis.cache.get(emoteId);
		if (!emoji) {
			return await interaction.defaultReply('An emote with that ID does not exist.', {
				tryEphemeral: true,
			});
		}

		const modal = this.module.buildCreditModal(settings.creditsChannelId, emoji.id, CreditType.Emote);
		return await interaction.showModal(modal);
	}

	public async chatInputSticker(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const emoteId = interaction.options.getString('name', true);
		const settings = await this.module.settings.get(interaction.guildId);

		if (!settings?.creditsChannelId) {
			return await interaction.defaultReply('There is no credits channel set. You can set one with `/credits set`');
		}

		const sticker = interaction.guild.stickers.cache.get(emoteId);
		if (!sticker) {
			return await interaction.defaultReply('A sticker with that ID does not exist.', {
				tryEphemeral: true,
			});
		}

		const modal = this.module.buildCreditModal(settings.creditsChannelId, sticker.id, CreditType.Sticker);
		return await interaction.showModal(modal);
	}

	public async chatInputImage(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		if (!settings?.creditsChannelId) {
			return await interaction.errorReply('There is no credits channel set. You can set one with `/credits set`');
		}

		const modal = this.module.buildCreditModal(settings.creditsChannelId);
		return await interaction.showModal(modal);
	}

	public async chatInputSet(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const { client, validator } = this.container;
		const channel = interaction.options.getChannel('channel', true, [
			ChannelType.GuildText,
			ChannelType.GuildAnnouncement,
		]);

		const { result, error } = await validator.channels.canSendEmbeds(channel);
		if (!result) {
			return client.emit(KBotErrors.ChannelPermissions, { interaction, error });
		}

		const settings = await this.module.settings.upsert(interaction.guildId, {
			creditsChannelId: channel.id,
		});

		return await this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const settings = await this.module.settings.upsert(interaction.guildId, {
			creditsChannelId: null,
		});

		return await this.showSettings(interaction, settings);
	}

	public async chatInputSettings(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const settings = await this.module.settings.get(interaction.guildId);

		return await this.showSettings(interaction, settings);
	}

	private async showSettings(
		interaction: KBotSubcommand.ChatInputCommandInteraction,
		settings: UtilitySettings | null,
	): Promise<unknown> {
		return await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Credit settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(
						`Channel: ${settings?.creditsChannelId ? channelMention(settings.creditsChannelId) : 'No channel set'}`,
					),
			],
		});
	}
}
