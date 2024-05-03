import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { EvalCustomIds, EvalFields } from '../../lib/utilities/customIds.js';
import { buildCustomId } from '../../lib/utilities/discord.js';
import { ActionRowBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { DevModule } from '../../modules/DevModule.js';

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Dev,
	description: 'Evaluate code.',
	preconditions: ['BotOwnerOnly'],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('dev_eval');
	}
})
export class DevCommand extends KBotCommand<DevModule> {
	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('dev_eval')
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: this.container.config.discord.devServers
			}
		);
	}

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<any> {
		const modal = new ModalBuilder() //
			.setCustomId(buildCustomId(EvalCustomIds.Eval))
			.setTitle('Eval')
			.setComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder() //
						.setCustomId(EvalFields.Code)
						.setLabel("What's the code to evaluate")
						.setStyle(TextInputStyle.Paragraph)
				)
			);

		await interaction.showModal(modal);
	}
}
