import { container } from '@sapphire/framework';
import { Logger } from '@sapphire/plugin-logger';
import { captureException, captureMessage } from '@sentry/node';
import type { Scope } from '@sentry/types';
import { redBright } from 'colorette';

export class KBotLogger extends Logger {
	public infoTag(tag: string, value: unknown): void {
		super.info(`[${redBright(tag)}] ${value}`);
	}

	public sentryMessage(message: string, { context }: { context?: NonNullable<unknown> } = {}): void {
		super.error(message);

		if (container.config.isDev) return;

		captureMessage(message, (scope): Scope => {
			if (context) scope.setExtras(context);
			return scope;
		});
	}

	public sentryError(
		error: unknown,
		{ message, context }: { message?: string; context?: NonNullable<unknown> } = {},
	): void {
		message //
			? super.error(message, error)
			: super.error(error);

		if (container.config.isDev) return;

		if (error instanceof Error) {
			captureException(error, (scope): Scope => {
				if (context) scope.setExtras(context);
				return scope;
			});
		}
	}
}
