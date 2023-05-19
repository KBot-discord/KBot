import { EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { MinageHandler } from '#structures/handlers/MinageHandler';
import { KBotCommand } from '#extensions/KBotCommand';
import { ModerationModule } from '#modules/ModerationModule';
import { KBotErrors } from '#types/Enums';
import { UnknownCommandError } from '#structures/errors/UnknownCommandError';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { InteractionEditReplyOptions } from 'discord.js';
import type { ModerationSettings } from '@kbotdev/prisma';

@ApplyOptions<KBotCommand.Options>({
	description: 'Set a minimum required account age for users to join the server.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.KickMembers],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Minage')
			.setDescription('Set a minimum required account age for users to join the server.')
			.setSubcommands([
				{ label: '/minage toggle <value>', description: 'Enable or disable minage' }, //
				{
					label: '/minage set [days] [message]',
					description: 'Set the account age requirements and kick message'
				},
				{ label: '/minage unset [days] [message]', description: 'Unset the current settings' },
				{ label: '/minage settings', description: 'Show the current settings' }
			]);
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.moderation);
	}

	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('minage')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('set')
							.setDescription('Set the account age requirements and kick message')
							.addIntegerOption((option) =>
								option //
									.setName('days')
									.setDescription('New users below the set amount of days will be kicked and sent a message')
									.setRequired(false)
							)
							.addStringOption((msg) =>
								msg //
									.setName('message')
									.setDescription('Message to be sent on kick')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('unset')
							.setDescription('Unset the current settings')
							.addBooleanOption((msg) =>
								msg //
									.setName('days')
									.setDescription('Reset the required days to 0')
									.setRequired(false)
							)
							.addBooleanOption((msg) =>
								msg //
									.setName('message')
									.setDescription('Reset the kick message to default')
									.setRequired(false)
							)
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('test')
							.setDescription('Test the minage message')
					)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable minage')
							.addBooleanOption((option) =>
								option //
									.setName('value')
									.setDescription('True: minage is enabled. False: minage is disabled.')
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
				return interaction.client.emit(KBotErrors.UnknownCommand, {
					interaction,
					error: new UnknownCommandError()
				});
			}
		}
	}

	public async chatInputToggle(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			minAccountAgeEnabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Minage settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? KBotEmoji.GreenCheck : KBotEmoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSet(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const days = interaction.options.getInteger('days');
		const response = interaction.options.getString('message');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			minAccountAgeReq: days,
			minAccountAgeMsg: response
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const days = interaction.options.getBoolean('days');
		const response = interaction.options.getBoolean('message');

		const settings = await this.module.settings.upsert(interaction.guildId, {
			minAccountAgeReq: days ? null : undefined,
			minAccountAgeMsg: response ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputTest(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const { member } = interaction;
		const settings = await this.module.settings.get(interaction.guildId);
		if (!settings) {
			return interaction.defaultReply('There are not settings to test.');
		}

		const options: InteractionEditReplyOptions = {};

		const req = settings.minAccountAgeReq ?? 0;
		const creation = member.user.createdTimestamp;
		const reqDay = Math.floor(86400000 * req);
		const reqDate = Math.floor(creation + reqDay);

		options.embeds = [ModerationModule.formatMinageEmbed(member, settings?.minAccountAgeMsg, req, reqDate)];

		return interaction.editReply(options);
	}

	public async chatInputSettings(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private async showSettings(interaction: KBotCommand.ChatInputCommandInteraction, settings: ModerationSettings | null): Promise<unknown> {
		const bot = await interaction.guild.members.fetchMe();
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Minage settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription('Run `/minage test` to see what the message would look like')
					.addFields([
						{
							name: 'Enabled',
							value: `${settings?.minAccountAgeEnabled ? `true ${KBotEmoji.GreenCheck}` : `false ${KBotEmoji.RedX}`}`
						},
						{
							name: 'Account age requirement',
							value: `${settings?.minAccountAgeReq ?? 0}`,
							inline: true
						},
						{
							name: 'Kick message',
							value: `${settings?.minAccountAgeMsg ?? MinageHandler.defaultMessage}`,
							inline: true
						},
						{
							name: 'Variables:',
							value: `\`{server}\` - The name of the server
							\`{req}\` - The required amount of days
							\`{days}\` - The amount of days until the user can join the server
							\`{date}\` - The date on which the user can join the server`
						},
						{
							name: 'Permissions:',
							value: `Kick Members: ${
								bot.permissions.has(PermissionFlagsBits.KickMembers) //
									? KBotEmoji.GreenCheck
									: KBotEmoji.RedX
							}`
						}
					])
			]
		});
	}
}
