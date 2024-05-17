import { Result } from '@sapphire/framework';
import { KBotError } from './errors/KBotError.js';
import type { KBotErrorOptions } from './errors/KBotError.js';

export abstract class ResultClass {
	public ok(): Result.Ok<undefined>;
	public ok<T>(value: T): Result.Ok<T>;
	public ok<T>(value?: T): Result.Ok<T | undefined> {
		return Result.ok(value);
	}

	public error(message: string, options: KBotErrorOptions): Result.Err<KBotError> {
		return Result.err(new KBotError(message, options));
	}
}
