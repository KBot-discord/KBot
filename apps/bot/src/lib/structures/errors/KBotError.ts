import type { KBotErrorCode } from '#types/Enums';

export type KBotErrorOptions = {
	name?: string;
	code: KBotErrorCode;
};

export class KBotError extends Error {
	public readonly code: KBotErrorCode;

	public constructor(message: string, { code, name = 'KBotError' }: KBotErrorOptions) {
		super(message);
		this.name = name;
		this.code = code;
	}
}
