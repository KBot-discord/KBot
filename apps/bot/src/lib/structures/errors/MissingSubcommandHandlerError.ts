import { KBotError } from '#structures/errors/KBotError';
import type { Command } from '@sapphire/framework';

export type MissingSubcommandHandlerErrorOptions = {
	command: Command;
	message?: string;
};

export class MissingSubcommandHandlerError extends KBotError {
	public readonly command: Command;

	public constructor(options: MissingSubcommandHandlerErrorOptions) {
		super(options.message ?? 'Encountered a command with a missing subcommand handler', {
			name: 'MissingSubcommandHandler',
			code: 'MISSING_SUBCOMMAND_HANDLER'
		});

		this.command = options.command;
	}
}
