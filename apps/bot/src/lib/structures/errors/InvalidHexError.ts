import { KBotError } from '#structures/errors/KBotError';

export class InvalidHexError extends KBotError {
	public constructor(message?: string) {
		super(message ?? 'Provided value is not a valid hex', {
			name: 'InvalidHexError',
			code: 'INVALID_HEX'
		});
	}
}
