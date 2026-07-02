import type { Module } from '@kbotdev/plugin-modules';
import { ModuleCommand } from '@kbotdev/plugin-modules';

export abstract class KBotCommand<M extends Module> extends ModuleCommand<M> {}

export namespace KBotCommand {
	export type Options = ModuleCommand.Options & {
		/**
		 * The description of the command.
		 */
		description: string;
	};

	export type Context = ModuleCommand.LoaderContext;
	export type ChatInputCommandInteraction = ModuleCommand.ChatInputCommandInteraction<'cached'>;
	export type ContextMenuCommandInteraction = ModuleCommand.ContextMenuCommandInteraction<'cached'>;
	export type AutocompleteInteraction = ModuleCommand.AutocompleteInteraction<'cached'>;
	export type Registry = ModuleCommand.Registry;
}
