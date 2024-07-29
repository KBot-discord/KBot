import { ModuleSubcommand } from '@kbotdev/plugin-modules';
import type { Module } from '@kbotdev/plugin-modules';
import type { EmbedBuilder } from 'discord.js';
import { HelpEmbedBuilder } from '../structures/builders/HelpEmbedBuilder.js';

export abstract class KBotSubcommand<M extends Module> extends ModuleSubcommand<M> {
	public helpEmbed: EmbedBuilder;

	public constructor(context: KBotSubcommand.Context, options: KBotSubcommand.Options) {
		super(context, options);

		this.helpEmbed = options
			.helpEmbed(new HelpEmbedBuilder()) //
			.setDescription(this.description)
			.setType(this.supportsContextMenuCommands() ? 'Context-menu command' : 'Slash command')
			.build();
	}
}

export namespace KBotSubcommand {
	export type Options = ModuleSubcommand.Options & {
		/**
		 * The description of the command.
		 */
		description: string;

		/**
		 * The data that will be shown when the help command is used.
		 */
		helpEmbed: (builder: HelpEmbedBuilder) => HelpEmbedBuilder;
	};

	export type Context = ModuleSubcommand.LoaderContext;
	export type ChatInputCommandInteraction = ModuleSubcommand.ChatInputCommandInteraction<'cached'>;
	export type ContextMenuCommandInteraction = ModuleSubcommand.ContextMenuCommandInteraction<'cached'>;
	export type AutocompleteInteraction = ModuleSubcommand.AutocompleteInteraction<'cached'>;
	export type Registry = ModuleSubcommand.Registry;
}
