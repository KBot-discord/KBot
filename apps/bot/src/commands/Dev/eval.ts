import { KBotCommand } from '#extensions/KBotCommand';
import { buildCustomId } from '#utils/functions';
import { EvalCustomIds, EvalFields } from '#utils/customIds';
import { KBotModules } from '#types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { ActionRowBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle } from 'discord.js';
import type { DevModule } from '#modules/DevModule';

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

	public override async chatInputRun(interaction: KBotCommand.ChatInputCommandInteraction): Promise<unknown> {
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

		return interaction.showModal(modal);
	}
}
