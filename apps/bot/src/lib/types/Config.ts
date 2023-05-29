import type { MeiliClientOptions } from '@kbotdev/meili';
import type { RedisClientOptions } from '@kbotdev/redis';

export type ClientConfig = {
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		webhook: string;
		devServers: string[];
		ownerIds: string[];
	};
	web: {
		url: string;
	};
	api: {
		host: string;
		port: number;
		auth: {
			cookie: string;
			domain: string;
		};
	};
	rpc: {
		server: {
			port: number;
		};
	};
	db: {
		url: string;
		cacheExpiry: number;
	};
	redis: RedisClientOptions;
	meili: MeiliClientOptions;
	holodex: {
		apiKey: string;
	};
	sentry: {
		dsn: string;
	};
	stats: {
		topgg: string;
	};
};
