import { HelpEmbedBuilder } from '#structures/HelpEmbedBuilder';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { EmbedBuilder } from 'discord.js';
import type { Module } from '@kbotdev/plugin-modules';

export abstract class KBotCommand<M extends Module = Module> extends ModuleCommand<M> {
	public helpEmbed: EmbedBuilder;

	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions, module: M) {
		super(
			context,
			{
				...options,
				description: options.description ?? (options.detailedDescription as string)
			},
			module
		);

		this.helpEmbed = options
			.helpEmbed(new HelpEmbedBuilder()) //
			.setType(
				this.supportsContextMenuCommands() //
					? 'Context-menu command'
					: 'Slash command'
			)
			.build();
	}
}

export type KBotCommandOptions = ModuleCommand.Options & {
	helpEmbed: (builder: HelpEmbedBuilder) => HelpEmbedBuilder;
};
