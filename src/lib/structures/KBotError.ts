export class KBotError extends Error {
	public readonly identifier: string;
	public readonly context: unknown;

	public constructor(options: KBotError.Options) {
		super(options.message);
		this.identifier = options.identifier;
		this.context = options.context;
	}
}

export namespace KBotError {
	export interface Options {
		identifier: string;
		message?: string;
		context?: string;
	}
}
