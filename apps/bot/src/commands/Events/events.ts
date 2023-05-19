import { EmbedColors, KBotEmoji } from '#utils/constants';
import { getGuildIcon } from '#utils/discord';
import { KBotCommand } from '#extensions/KBotCommand';
import { KBotErrors } from '#types/Enums';
import { UnknownCommandError } from '#structures/errors/UnknownCommandError';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import type { EventModule } from '#modules/EventModule';

@ApplyOptions<KBotCommand.Options>({
	description: 'Edit the settings of the events module.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Events')
			.setDescription('Edit the settings of the events module.')
			.setSubcommands([
				{ label: '/events toggle <value>', description: 'Enable or disable the events module' }, //
				{ label: '/events settings', description: 'Show the current settings' }
			]);
	}
})
export class EventsCommand extends KBotCommand<EventModule> {
	public constructor(context: ModuleCommand.Context, options: KBotCommand.Options) {
		super(context, { ...options }, container.events);
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('events')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
					.setDMPermission(false)
					.addSubcommand((subcommand) =>
						subcommand //
							.setName('toggle')
							.setDescription('Enable or disable the events module')
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
			case 'toggle': {
				return this.chatInputToggle(interaction);
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
			enabled: value
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Events module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? KBotEmoji.GreenCheck : KBotEmoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSettings(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Events module settings', iconURL: getGuildIcon(interaction.guild) })
					.addFields([
						{
							name: 'Module enabled',
							value: `${settings?.enabled ? KBotEmoji.GreenCheck : KBotEmoji.RedX}`
						}
					])
			]
		});
	}
}
