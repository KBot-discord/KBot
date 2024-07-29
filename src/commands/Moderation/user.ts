import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { getUserInfo } from '../../lib/utilities/discord.js';
import type { ModerationModule } from '../../modules/ModerationModule.js';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Moderation,
	description: 'Get info on a user.',
	preconditions: ['Defer', 'ModuleEnabled'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('User')
			.setOption({ label: '/user <target>' });
	},
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
							.setRequired(true),
					),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
		const userId = interaction.options.getUser('target', true).id;
		const embed = await getUserInfo(interaction, userId);

		return await interaction.editReply({ embeds: [embed] });
	}
}
