import { HelpEmbedBuilder } from '#structures/builders/HelpEmbedBuilder';
import { KBotErrors } from '#types/Enums';
import { MissingSubcommandHandlerError } from '#structures/errors/MissingSubcommandHandlerError';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { EmbedBuilder } from 'discord.js';
import type { Module } from '@kbotdev/plugin-modules';

export abstract class KBotCommand<M extends Module> extends ModuleCommand<M> {
	public helpEmbed: EmbedBuilder;

	public constructor(context: KBotCommand.Context, options: KBotCommand.Options) {
		super(context, options);

		this.helpEmbed = options
			.helpEmbed(new HelpEmbedBuilder()) //
			.setDescription(this.description)
			.setType(this.supportsContextMenuCommands() ? 'Context-menu command' : 'Slash command')
			.build();
	}

	protected unknownSubcommand(interaction: KBotCommand.ChatInputCommandInteraction): void {
		interaction.client.emit(KBotErrors.MissingSubcommandHandler, {
			interaction,
			error: new MissingSubcommandHandlerError({ command: this })
		});
	}
}

export namespace KBotCommand {
	export type Options = ModuleCommand.Options & {
		/**
		 * The description of the command.
		 */
		description: string;

		/**
		 * The data that will be shown when the help command is used.
		 */
		helpEmbed: (builder: HelpEmbedBuilder) => HelpEmbedBuilder;
	};

	export type JSON = ModuleCommand.JSON;
	export type Context = ModuleCommand.Context;
	export type RunInTypes = ModuleCommand.RunInTypes;
	export type ChatInputCommandInteraction = ModuleCommand.ChatInputCommandInteraction<'cached'>;
	export type ContextMenuCommandInteraction = ModuleCommand.ContextMenuCommandInteraction<'cached'>;
	export type AutocompleteInteraction = ModuleCommand.AutocompleteInteraction<'cached'>;
	export type Registry = ModuleCommand.Registry;
}
