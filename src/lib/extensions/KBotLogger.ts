import { Logger } from '@sapphire/plugin-logger';
import { redBright } from 'colorette';

export class KBotLogger extends Logger {
	public infoTag(tag: string, value: unknown): void {
		super.info(`[${redBright(tag)}] ${value}`);
	}
}
