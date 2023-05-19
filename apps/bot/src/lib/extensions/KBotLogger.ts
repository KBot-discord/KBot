import { Logger, container } from '@sapphire/framework';
import { captureException, captureMessage } from '@sentry/node';
import type { ILogger } from '@sapphire/framework';
import type { Scope } from '@sentry/types';

export class KBotLogger extends Logger implements ILogger {
	public sentryMessage(message: string, context?: NonNullable<unknown>): void {
		super.error(message);

		if (container.config.isDev) return;

		captureMessage(message, (scope): Scope => {
			if (context) scope.setExtras(context);
			return scope;
		});
	}

	public sentryError(error: Error, context?: NonNullable<unknown>): void {
		super.error(error);

		if (container.config.isDev) return;

		captureException(error, (scope): Scope => {
			if (context) scope.setExtras(context);
			return scope;
		});
	}
}
