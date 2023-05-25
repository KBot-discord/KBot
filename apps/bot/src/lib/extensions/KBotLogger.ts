import { KBotErrors } from '#types/Enums';
import { WebhookErrorBuilder } from '#structures/builders/WebhookErrorBuilder';
import { Logger, Result, container } from '@sapphire/framework';
import { captureException, captureMessage } from '@sentry/node';
import { isColorSupported, bgRed, cyan, gray, magenta, red, white, yellow } from 'colorette';
import { LogLevel } from '@sapphire/framework';
import { inspect } from 'util';
import type { EmbedBuilder } from 'discord.js';
import type { Color } from 'colorette';
import type { Scope } from '@sentry/types';

export class KBotLogger extends Logger {
	private readonly formats = new Map<LogLevel, (content: string) => string>([
		[LogLevel.Trace, (content: string): string => this.stylize(content, gray, 'TRACE')],
		[LogLevel.Debug, (content: string): string => this.stylize(content, magenta, 'DEBUG')],
		[LogLevel.Info, (content: string): string => this.stylize(content, cyan, 'INFO')],
		[LogLevel.Warn, (content: string): string => this.stylize(content, yellow, 'WARN')],
		[LogLevel.Error, (content: string): string => this.stylize(content, red, 'ERROR')],
		[LogLevel.Fatal, (content: string): string => this.stylize(content, bgRed, 'FATAL')],
		[LogLevel.None, (content: string): string => this.stylize(content, white, '')]
	]);

	public sentryMessage(message: string, { context }: { context?: NonNullable<unknown> } = {}): void {
		super.error(message);

		if (container.config.isDev) return;

		captureMessage(message, (scope): Scope => {
			if (context) scope.setExtras(context);
			return scope;
		});
	}

	public sentryError(error: unknown, { message, context }: { message?: string; context?: NonNullable<unknown> } = {}): void {
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

	public async webhookError(builder: (builder: WebhookErrorBuilder) => WebhookErrorBuilder): Promise<void> {
		const embed: EmbedBuilder = builder(new WebhookErrorBuilder()).build();

		const result = await Result.fromAsync(async () => {
			return container.client.webhook.send({ embeds: [embed] });
		});

		if (result.isErr()) {
			result.inspectErr((error) => {
				container.client.emit(KBotErrors.WebhookError, error);
			});
		}
	}

	public override write(level: LogLevel, ...values: readonly unknown[]): void {
		if (level < this.level) return;

		const method = Logger.levels.get(level)!;
		const formatter = this.formats.get(level)!;

		console[method](formatter(this.process(values)));
	}

	private process(values: readonly unknown[]): string {
		return values
			.map((value) =>
				typeof value === 'string' //
					? value
					: inspect(value, { colors: isColorSupported, depth: 0 })
			)
			.join('\n');
	}

	private stylize(content: string, color: Color, name: string): string {
		const utc = new Date(new Date().toUTCString());
		const timestamp = this.formatTime(utc);

		const prefix = `${color(`[${timestamp}] ${name.padEnd(5, ' ')}`)} - `;

		return content
			.split('\n')
			.map((line: string) => prefix + line)
			.join('\n');
	}

	private formatTime(date: Date): string {
		const year = String(date.getFullYear());
		const month = this.pad(date.getMonth() + 1);
		const day = this.pad(date.getDate());

		const hour = this.pad(date.getHours());
		const minute = this.pad(date.getMinutes());
		const second = this.pad(date.getSeconds());

		return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	}

	private pad(time: number): string {
		return String(time).padStart(2, '0');
	}
}
