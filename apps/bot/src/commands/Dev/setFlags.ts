import { EmbedColors } from '#lib/utilities/constants';
import { KBotModules } from '#lib/types/Enums';
import { FlagHandler } from '#lib/structures/handlers/FlagHandler';
import { KBotCommand } from '#lib/extensions/KBotCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder } from 'discord.js';
import { FeatureFlags } from '@prisma/client';
import type { APISelectMenuOption } from 'discord.js';
import type { DevModule } from '#modules/DevModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Dev,
	description: 'Set the feature flags for a guild',
	preconditions: ['BotOwnerOnly'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed(builder) {
		return builder //
			.setName('dev_setflags');
	}
})
export class DevCommand extends KBotCommand<DevModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
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
