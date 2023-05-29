import { KBotError } from '#structures/errors/KBotError';
import { KBotErrorCodes } from '#types/Enums';

export type DiscordFetchErrorErrorOptions = {
	message?: string;
	userMessage?: string;
	resourceId: string;
};

export class DiscordFetchError extends KBotError {
	public override readonly userMessage: string;

	public readonly resourceId: string;

	public constructor(options: DiscordFetchErrorErrorOptions) {
		super(options.message ?? `Failed to fetch a Discord resource`, {
			name: 'DiscordFetchError',
			code: KBotErrorCodes.DiscordFetch
		});

		this.userMessage = options.userMessage ?? 'Something went wrong.';
		this.resourceId = options.resourceId;
	}
}
