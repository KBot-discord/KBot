import { KBotError } from '#structures/errors/KBotError';

export class UnknownCommandError extends KBotError {
	public constructor(message?: string) {
		super(message ?? 'There is a command with no handler', {
			name: 'UnknownCommandError',
			code: 'UNKNOWN_COMMAND'
		});
	}
}
