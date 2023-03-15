import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { WelcomeModule } from '#modules/WelcomeModule';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { channelMention, EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { APIEmbedField } from 'discord-api-types/v10';
import type { InteractionEditReplyOptions, ColorResolvable, NewsChannel, TextChannel } from 'discord.js';
import type { WelcomeSettings } from '#prisma';

@ApplyOptions<KBotCommandOptions>({
	module: 'WelcomeModule',
	description: 'Edit the settings of the welcome module.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
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
	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('welcome')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
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
							.setName('set')
							.setDescription('Set new welcome module settings')
							.addChannelOption((option) =>
								option //
									.setName('channel')
									.setDescription('Set a welcome channel')
									.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
									.setRequired(false)
							)
							.addStringOption((option) =>
								option //
									.setName('message')
									.setDescription('Set a welcome message')
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
							.setName('settings')
							.setDescription('Show the current settings')
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();
		switch (interaction.options.getSubcommand(true)) {
			case 'toggle': {
				return this.chatInputToggle(interaction);
			}
			case 'set': {
				return this.chatInputSet(interaction);
			}
			case 'unset': {
				return this.chatInputUnset(interaction);
			}
			case 'test': {
				return this.chatInputTest(interaction);
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

	public async chatInputToggle(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.upsertSettings(interaction.guildId, {
			enabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Welcome module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? Emoji.GreenCheck : Emoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const channel = interaction.options.getChannel('channel') as TextChannel | NewsChannel | null;
		const message = interaction.options.getString('message');
		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');
		const image = interaction.options.getString('image');
		const color = interaction.options.getString('color');

		const settings = await this.module.upsertSettings(interaction.guildId, {
			channelId: channel?.id,
			message: message ?? undefined,
			title: title ?? undefined,
			description: description ?? undefined,
			image: image ?? undefined,
			color: color ?? undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const channel = interaction.options.getBoolean('channel');
		const message = interaction.options.getBoolean('message');
		const title = interaction.options.getBoolean('title');
		const description = interaction.options.getBoolean('description');
		const image = interaction.options.getBoolean('image');
		const color = interaction.options.getBoolean('color');

		const settings = await this.module.upsertSettings(interaction.guildId, {
			channelId: channel ? null : undefined,
			message: message ? null : undefined,
			title: title ? null : undefined,
			description: description ? null : undefined,
			image: image ? null : undefined,
			color: color ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputTest(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const { member } = interaction;
		const settings = await this.module.getSettings(interaction.guildId);
		if (!settings) {
			return interaction.defaultReply('There are no settings to test');
		}

		const options: InteractionEditReplyOptions = { allowedMentions: { users: [member.id] } };

		if (!isNullish(settings.message)) {
			options.content = WelcomeModule.formatText(settings.message, member);
		}

		if (settings.title || settings.description || settings.image) {
			const embed = new EmbedBuilder()
				.setColor((settings.color as ColorResolvable) ?? EmbedColors.Default)
				.setImage(settings.image)
				.setFooter({ text: `Total members: ${interaction.guild.memberCount}` })
				.setTimestamp();

			if (settings.title) {
				embed.setTitle(WelcomeModule.formatText(settings.title, member));
			}

			if (settings.description) {
				embed.setDescription(WelcomeModule.formatText(settings.description, member));
			}

			options.embeds = [embed];
		}

		return interaction.editReply(options);
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private async showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, settings: WelcomeSettings | null) {
		const { channels, members } = interaction.guild;

		const bot = await members.fetchMe();
		const fields: APIEmbedField[] = [
			{
				name: 'Variables:',
				value: "`{@member}` - To @ them\n`{membertag}` - The members's discord tag (ex: KBot#7091)\n`{server}` - The server name\n`{nl}` - To add a line break"
			},
			{ name: 'Enabled:', value: settings?.enabled ? ':white_check_mark: Welcome messages are enabled' : ':x: Welcome messages are disabled' },
			{ name: 'Channel:', value: settings?.channelId ? channelMention(settings.channelId) : 'No channel set' },
			{ name: 'Message:', value: settings?.message || 'No message set' },
			{ name: 'Title:', value: settings?.title || 'No title set' },
			{ name: 'Description:', value: settings?.description || 'No description set' },
			{ name: 'Color:', value: settings?.color ? `\`\`${settings.color}\`\` (see this embed's color)` : 'No color set' },
			{ name: 'Image:', value: settings?.image ? 'See image below' : 'No image set' }
		];

		if (!isNullish(settings) && !isNullish(settings.channelId)) {
			const welcomeChannel = await channels.fetch(settings.channelId);
			if (!isNullish(welcomeChannel)) {
				const modlogViewChannel = bot.permissionsIn(welcomeChannel).has(PermissionFlagsBits.ViewChannel);
				const modlogSendMessage = bot.permissionsIn(welcomeChannel).has(PermissionFlagsBits.SendMessages);
				const modlogEmbedLinks = bot.permissionsIn(welcomeChannel).has(PermissionFlagsBits.EmbedLinks);

				const modlogViewString = `View channel: ${this.formatField(modlogViewChannel)}`;
				const modlogSendString = `Send messages: ${this.formatField(modlogSendMessage)}`;
				const modlogEmbedString = `Embed links: ${this.formatField(modlogEmbedLinks)}`;

				fields.push({ name: 'Channel permissions', value: `${modlogViewString}\n${modlogSendString}\n${modlogEmbedString}`, inline: true });
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
		return bool ? Emoji.GreenCheck : Emoji.RedX;
	}
}
