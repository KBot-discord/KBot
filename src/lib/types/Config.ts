import type { MeiliClientOptions } from '../meili/types/MeiliClientOptions.js';

export type ClientConfig = {
	env: string;
	isDev: boolean;
	enableTasks: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		webhook: string;
		devServers: string[];
		ownerIds: string[];
	};
	api: {
		host: string;
		port: number;
	};
	db: {
		url: string;
	};
	redis: {
		host: string;
		port: number;
		password: string;
	};
	meili: MeiliClientOptions;
	holodex: {
		apiKey: string;
	};
	sentry: {
		dsn: string;
	};
};
