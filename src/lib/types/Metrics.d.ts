import type { Counter } from 'prom-client';

export interface KBotCounters {
	commands: Counter;
	twitch: Counter;
	youtube: Counter;
}
