import { EmbedColors, HexColorRegex, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { WelcomeModule } from '#modules/WelcomeModule';
import { KBotCommand } from '#extensions/KBotCommand';
import { isNullOrUndefined } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { channelMention, EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { APIEmbedField } from 'discord-api-types/v10';
import type { InteractionEditReplyOptions, ColorResolvable } from 'discord.js';
import type { WelcomeSettings } from '@kbotdev/prisma';

@ApplyOptions<KBotCommand.Options>({
	description: 'Edit the settings of the welcome module.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Welcome')
			.setDescription('Edit the settings of the welcome module.')
			.setSubcommands([
				{ label: '/welcome toggle <value>', description: 'Enable or disable the welcome module' }, //
				{
					label: '/welcome set [channel] [message] [title] [description] [image] [color]',
					description: 'Set new welcome module settings'
				},
				{
					label: '/welcome unset [channel] [message] [title] [description] [image] [color]',
					description: 'Reset welcome module settings'
				},
				{ label: '/welcome test', description: 'Test the welcome message' },
				{ label: '/welcome settings', description: 'Show the current settings' }
			]);
	}
})
export class EventsCommand extends KBotCommand<WelcomeModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.welcome);
	}

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('welcome')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set new welcome module settings')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('The channel to send welcome messages to')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('The content of the message')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('title')
									.setDescription('The title of the embed')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('description')
									.setDescription('The description of the embed')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('image')
									.setDescription('The image to use for the embed')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('color')
									.setDescription('The color of the embed')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Reset welcome module settings')
							.addBooleanOption((option) =>
								option //
									.setName('channel')
									.setDescription('Unset the current welcome channel')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('Unset the current welcome message')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('title')
									.setDescription('Unset the current the title of the embed')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('description')
									.setDescription('Unset the current the description of the embed')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('image')
									.setDescription('Unset the current the image')
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('color')
									.setDescription('Unset the current the color of the embed')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('test')
							.setDescription('Test the welcome message')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable the welcome module')
							.addBooleanOption((option) =>
								option //
									.setName('value')
									.setDescription('True: the module is enabled. False: The module is disabled.')
									.setRequired(true)
							)
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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'toggle':
				return this.chatInputToggle(interaction);
			case 'set':
				return this.chatInputSet(interaction);
			case 'unset':
				return this.chatInputUnset(interaction);
			case 'test':
				return this.chatInputTest(interaction);
			case 'settings':
				return this.chatInputSettings(interaction);
			default:
				return this.unknownSubcommand(interaction);
		}
	}

	public async chatInputToggle(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			enabled: value
		});

		const description = settings.enabled //
			? `${KBotEmoji.GreenCheck} module is now enabled`
			: `${KBotEmoji.RedX} module is now disabled`;

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Welcome module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(description)
			]
		});
	}

	public async chatInputSet(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText, ChannelType.GuildAnnouncement]);
		const message = interaction.options.getString('message');
		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');
		const image = interaction.options.getString('image');
		const color = interaction.options.getString('color');

		if (!isNullOrUndefined(color) && HexColorRegex.test(color)) {
			return interaction.errorReply('Please provide a valid Hex color.');
		}

		const settings = await this.module.settings.upsert(interaction.guildId, {
			channelId: channel?.id,
			message: message ?? undefined,
			title: title ?? undefined,
			description: description ?? undefined,
			image: image ?? undefined,
			color: color ?? undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const channel = interaction.options.getBoolean('channel');
		const message = interaction.options.getBoolean('message');
		const title = interaction.options.getBoolean('title');
		const description = interaction.options.getBoolean('description');
		const image = interaction.options.getBoolean('image');
		const color = interaction.options.getBoolean('color');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			channelId: channel ? null : undefined,
			message: message ? null : undefined,
			title: title ? null : undefined,
			description: description ? null : undefined,
			image: image ? null : undefined,
			color: color ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputTest(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { member } = interaction;
		const settings = await this.module.settings.get(interaction.guildId);
		if (!settings || (!settings.message && !settings.title && !settings.description && !settings.image)) {
			return interaction.defaultReply('There are no settings to test');
		}

		const options: InteractionEditReplyOptions = { allowedMentions: { users: [member.id] } };

		if (!isNullOrUndefined(settings.message) && settings.message.length > 0) {
			options.content = WelcomeModule.formatText(settings.message, member);
		}

		if (settings.title || settings.description || settings.image) {
			const embed = new EmbedBuilder()
				.setColor((settings.color as ColorResolvable | undefined) ?? EmbedColors.Default)
				.setImage(settings.image)
				.setFooter({ text: `Total members: ${interaction.guild.memberCount}` })
				.setTimestamp();

			if (settings.title && settings.title.length > 0) {
				embed.setTitle(WelcomeModule.formatText(settings.title, member));
			}

			if (settings.description && settings.description.length > 0) {
				embed.setDescription(WelcomeModule.formatText(settings.description, member));
			}

			options.embeds = [embed];
		}

		return interaction.editReply(options);
	}

	public async chatInputSettings(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private async showSettings(interaction: KBotCommand.ChatInputCommandInteraction, settings: WelcomeSettings | null): Promise<unknown> {
		const { channels, members } = interaction.guild;

		const bot = await members.fetchMe();
		const fields: APIEmbedField[] = [
			{
				name: 'Enabled:',
				value: settings?.enabled ? ':white_check_mark: Welcome messages are enabled' : ':x: Welcome messages are disabled'
			},
			{
				name: 'Channel:',
				value: settings?.channelId ? channelMention(settings.channelId) : 'No channel set'
			},
			{ name: 'Message:', value: settings?.message ?? 'No message set', inline: true },
			{ name: 'Title:', value: settings?.title ?? 'No title set', inline: true },
			{ name: 'Description:', value: settings?.description ?? 'No description set', inline: true },
			{
				name: 'Color:',
				value: settings?.color ? `\`${settings.color}\` (see this embed's color)` : 'No color set',
				inline: true
			},
			{ name: 'Image:', value: settings?.image ? 'See image below' : 'No image set', inline: true },
			{
				name: 'Variables:',
				value: `\`{@member}\` - To @ them
				\`{membertag}\` - The members's discord tag (ex: KBot#7091)
				\`{server}\` - The name of the server
				\`{nl}\` - To add a line break`
			}
		];

		if (!isNullOrUndefined(settings) && !isNullOrUndefined(settings.channelId)) {
			const welcomeChannel = await channels.fetch(settings.channelId);
			if (!isNullOrUndefined(welcomeChannel)) {
				const viewChannel = bot.permissionsIn(welcomeChannel).has(PermissionFlagsBits.ViewChannel);
				const sendMessage = bot.permissionsIn(welcomeChannel).has(PermissionFlagsBits.SendMessages);
				const embedLinks = bot.permissionsIn(welcomeChannel).has(PermissionFlagsBits.EmbedLinks);

				const viewString = `View channel: ${this.formatField(viewChannel)}`;
				const sendString = `Send messages: ${this.formatField(sendMessage)}`;
				const embedString = `Embed links: ${this.formatField(embedLinks)}`;

				fields.push({
					name: 'Channel permissions',
					value: `${viewString}\n${sendString}\n${embedString}`,
					inline: true
				});
			}
		}

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor((settings?.color ?? EmbedColors.Default) as ColorResolvable)
					.setAuthor({ name: 'Welcome module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(
						"• Run ``/welcome test`` to see what the message would look like\n• Welcome messages won't be sent if there if there's not at least a message, title, or description, and does not have the required permissions"
					)
					.addFields(fields)
					.setImage(settings?.image ?? null)
			]
		});
	}

	private formatField(bool: boolean): string {
		return bool ? KBotEmoji.GreenCheck : KBotEmoji.RedX;
	}
}
