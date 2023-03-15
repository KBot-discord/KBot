import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { MinageHandler } from '#structures/handlers/MinageHandler';
import { KBotCommand, KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModerationModule } from '#modules/ModerationModule';
import type { ModerationSettings } from '#prisma';

@ApplyOptions<KBotCommandOptions>({
	module: 'ModerationModule',
	description: 'Set a minimum required account age for users to join the server.',
	preconditions: ['ModuleEnabled'],
	requiredClientPermissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	deferOptions: { defer: true },
	helpEmbed: (builder) => {
		return builder //
			.setName('Minage')
			.setDescription('Set a minimum required account age for users to join the server.')
			.setSubcommands([
				{ label: '/minage toggle <value>', description: 'Enable or disable minage' }, //
				{ label: '/minage set [days] [message]', description: 'Set the account age requirements and kick message' },
				{ label: '/minage unset [days] [message]', description: 'Unset the current settings' },
				{ label: '/minage settings', description: 'Show the current settings' }
			]);
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
					.setName('minage')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
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
							.setName('set')
							.setDescription('Set the account age requirements and kick message')
							.addIntegerOption((option) =>
								option //
									.setName('days')
									.setDescription('New users below the set age will be kicked and sent a message')
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
			minAccountAgeEnabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Minage settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? Emoji.GreenCheck : Emoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSet(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const days = interaction.options.getInteger('days');
		const response = interaction.options.getString('message');

		const settings = await this.module.upsertSettings(interaction.guildId, {
			minAccountAgeReq: days,
			minAccountAgeMsg: response
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputUnset(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const days = interaction.options.getBoolean('days');
		const response = interaction.options.getBoolean('message');

		const settings = await this.module.upsertSettings(interaction.guildId, {
			minAccountAgeReq: days ? null : undefined,
			minAccountAgeMsg: response ? null : undefined
		});

		return this.showSettings(interaction, settings);
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);

		return this.showSettings(interaction, settings);
	}

	private showSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>, settings: ModerationSettings | null) {
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Minage settings', iconURL: getGuildIcon(interaction.guild) })
					.addFields([
						{ name: 'Enabled', value: `${settings?.minAccountAgeEnabled ? `true ${Emoji.GreenCheck}` : `false ${Emoji.RedX}`}` },
						{
							name: 'Account age requirement',
							value: `${settings?.minAccountAgeReq ?? 0}`,
							inline: true
						},
						{
							name: 'Kick message',
							value: `${settings?.minAccountAgeMsg ?? MinageHandler.defaultMessage}`,
							inline: true
						}
					])
			]
		});
	}
}