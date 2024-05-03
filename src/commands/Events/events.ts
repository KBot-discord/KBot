import { KBotSubcommand } from '../../lib/extensions/KBotSubcommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { EmbedColors, KBotEmoji } from '../../lib/utilities/constants.js';
import { getGuildIcon } from '../../lib/utilities/discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { ModuleCommand } from '@kbotdev/plugin-modules';
import type { EventModule } from '../../modules/EventModule.js';

@ApplyOptions<KBotSubcommand.Options>({
	module: KBotModules.Events,
	description: 'Edit the settings of the events module.',
	preconditions: ['Defer'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('Events')
			.setSubcommands([
				{ label: '/events toggle <value>', description: 'Enable or disable the events module' }, //
				{ label: '/events settings', description: 'Show the current settings' }
			]);
	},
	subcommands: [
		{ name: 'toggle', chatInputRun: 'chatInputToggle' },
		{ name: 'settings', chatInputRun: 'chatInputSettings' }
	]
})
export class EventsCommand extends KBotSubcommand<EventModule> {
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

	public async chatInputToggle(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const value = interaction.options.getBoolean('value', true);

		const settings = await this.module.settings.upsert(interaction.guildId, {
			enabled: value
		});

		const description = settings.enabled //
			? `${KBotEmoji.GreenCheck} module is now enabled`
			: `${KBotEmoji.RedX} module is now disabled`;

		return await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Events module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(description)
			]
		});
	}

	public async chatInputSettings(interaction: KBotSubcommand.ChatInputCommandInteraction): Promise<unknown> {
		const settings = await this.module.settings.get(interaction.guildId);

		return await interaction.editReply({
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
