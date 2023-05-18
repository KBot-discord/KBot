import type { Counter } from 'prom-client';

export type KBotCounters = {
	commands: Counter;
	youtube: Counter;
	holodex: Counter;
};
