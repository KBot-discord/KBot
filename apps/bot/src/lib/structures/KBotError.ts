import type { KBotErrorCode } from '#types/Enums';

export class KBotError extends Error {
	public readonly code: KBotErrorCode;

	public constructor(message: string, code: KBotErrorCode) {
		super(message);
		this.name = 'KBotError';
		this.code = code;
	}
}
