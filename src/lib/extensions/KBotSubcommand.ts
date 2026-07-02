import type { Module } from '@kbotdev/plugin-modules';
import { ModuleSubcommand } from '@kbotdev/plugin-modules';

export abstract class KBotSubcommand<M extends Module> extends ModuleSubcommand<M> {}

export namespace KBotSubcommand {
	export type Options = ModuleSubcommand.Options & {
		/**
		 * The description of the command.
		 */
		description: string;
	};

	export type Context = ModuleSubcommand.LoaderContext;
	export type ChatInputCommandInteraction = ModuleSubcommand.ChatInputCommandInteraction<'cached'>;
	export type ContextMenuCommandInteraction = ModuleSubcommand.ContextMenuCommandInteraction<'cached'>;
	export type AutocompleteInteraction = ModuleSubcommand.AutocompleteInteraction<'cached'>;
	export type Registry = ModuleSubcommand.Registry;
}
