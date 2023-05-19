import type { RedisClientOptions } from '@kbotdev/redis';

export type ClientConfig = {
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		devServers: Array<string>;
		ownerIds: Array<string>;
		webhookError: {
			id: string;
			token: string;
		};
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
	meili: {
		host: string;
		port: number;
		apiKey: string;
	};
	holodex: {
		apiKey: string;
		twitchConflicts: Array<string>;
	};
	sentry: {
		dsn: string;
	};
	stats: {
		topgg: string;
	};
};
