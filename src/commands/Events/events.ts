import { EmbedColors, Emoji } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { EmbedBuilder } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { EventModule } from '#modules/EventModule';

@ApplyOptions<ModuleCommand.Options>({
	module: 'EventModule',
	description: 'Edit the settings of the events module.',
	requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class EventsCommand extends ModuleCommand<EventModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('events')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
			default: {
				return this.chatInputSettings(interaction);
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
					.setAuthor({ name: 'Events module settings', iconURL: getGuildIcon(interaction.guild) })
					.setDescription(`${settings.enabled ? Emoji.GreenCheck : Emoji.RedX} module is now ${settings.enabled ? 'enabled' : 'disabled'}`)
			]
		});
	}

	public async chatInputSettings(interaction: ModuleCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = await this.module.getSettings(interaction.guildId);
		const karaokeEventCount = await this.module.karaoke.countEvents(interaction.guildId);

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'Events module settings', iconURL: getGuildIcon(interaction.guild) })
					.addFields([
						{ name: 'Module enabled', value: `${settings?.enabled ? Emoji.GreenCheck : Emoji.RedX}` },
						{ name: '# of karaoke events', value: `${karaokeEventCount}`, inline: true }
					])
			]
		});
	}
}
