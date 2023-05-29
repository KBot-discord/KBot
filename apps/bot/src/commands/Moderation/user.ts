import { KBotCommand } from '#extensions/KBotCommand';
import { getUserInfo } from '#utils/discord';
import { KBotModules } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import type { ModerationModule } from '#modules/ModerationModule';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Moderation,
	description: 'Get info on a user.',
	preconditions: ['ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('User')
			.setOptions({ label: '/user <target>' });
	}
})
export class ModerationCommand extends KBotCommand<ModerationModule> {
	public override disabledMessage = (moduleFullName: string): string => {
		return `[${moduleFullName}] The module for this command is disabled.\nYou can run \`/moderation toggle\` to enable it.`;
	};

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('user')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false)
					.addUserOption((option) =>
						option //
							.setName('target')
							.setDescription('The user or the ID of the user to get info for')
							.setRequired(true)
					),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		await interaction.deferReply();

		const userId = interaction.options.getUser('target', true).id;
		const embed = await getUserInfo(interaction, userId);

		return interaction.editReply({ embeds: [embed] });
	}
}
