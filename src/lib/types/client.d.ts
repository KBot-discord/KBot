// Imports
import type { Counter } from 'prom-client';

export interface Metrics {
	counters: {
		commands: {
			count: Counter;
		};
		/*
        twitch: {
            count: Counter;
        }
        youtube: {
            count: Counter;
        }
        */
	};
}
