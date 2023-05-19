import { EmbedColors } from '#utils/constants';
import { FlagHandler } from '#structures/handlers/FlagHandler';
import { FeatureFlags } from '@kbotdev/prisma';
import { ButtonStyle, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder } from 'discord.js';
import type { APISelectMenuOption } from 'discord-api-types/v10';

@ApplyOptions<Command.Options>({
	description: 'Set the feature flags for a guild',
	preconditions: ['BotOwnerOnly'],
	runIn: ['GUILD_ANY']
})
export class DevCommand extends Command {
	public constructor(context: ModuleCommand.Context, options: Command.Options) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('dev_setflags')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false)
					.addStringOption((option) =>
						option //
							.setName('guild')
							.setDescription('The guild to set feature flags for.')
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public override async chatInputRun(interaction: ModuleCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();
		const guildId = interaction.options.getString('guild', true);

		const guild = interaction.client.guilds.cache.get(guildId);
		if (!guild) {
			return interaction.errorReply('That guild does not exist.');
		}

		const currentFlags = await this.container.core.settings.get(guild.id).then((res) => res?.flags ?? []);
		const flagsArray: FeatureFlags[] = Object.values(FeatureFlags).filter((flag) => flag !== 'UNDEFINED');
		const flagOptions: APISelectMenuOption[] = flagsArray.map((flag) => ({
			label: flag,
			value: flag
		}));

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setTitle(`Feature flags for: ${guild.id}`)
					.setDescription(`**Current flags:**\n${this.formatFlags(currentFlags)}\n\n**Available flags:**\n${this.formatFlags(flagsArray)}`)
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
					new StringSelectMenuBuilder()
						.setCustomId('featureflags-menu')
						.setPlaceholder('Click here to select the flags')
						.setOptions(flagOptions)
						.setMinValues(0)
						.setMaxValues(flagOptions.length)
				]),
				new ActionRowBuilder<ButtonBuilder>().setComponents([
					new ButtonBuilder() //
						.setCustomId('featureflags-save')
						.setLabel('Save')
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder() //
						.setCustomId('featureflags-cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger)
				])
			]
		});

		return new FlagHandler({
			response: interaction,
			targetGuild: guild,
			target: interaction.user
		});
	}

	private formatFlags(flags: FeatureFlags[]): string {
		return flags.map((flag) => `\`${flag}\``).join(' ');
	}
}
