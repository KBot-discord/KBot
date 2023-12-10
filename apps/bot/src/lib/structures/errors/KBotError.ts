import type { KBotErrorCode } from '#lib/types/Enums';

export type KBotErrorOptions = {
	name?: string;
	code: KBotErrorCode;
	userMessage?: string;
};

export class KBotError extends Error {
	public override readonly name: string;

	public readonly code: KBotErrorCode;

	public readonly userMessage: string | undefined;

	public constructor(message: string, { name, code, userMessage }: KBotErrorOptions) {
		super(message);

		this.name = name ?? 'KBotError';
		this.code = code;
		this.userMessage = userMessage;
	}
}
