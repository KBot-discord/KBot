import type { Counter } from 'prom-client';

export interface KBotCounters {
	commands: Counter;
	youtube: Counter;
	holodex: Counter;
}
