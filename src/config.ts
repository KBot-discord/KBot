process.env.NODE_ENV ??= 'dev'; // Set env to dev if NODE_ENV is undefined

import type { Config } from './lib/types/config';

export const config: Config = {
	isDev: process.env.NODE_ENV !== 'production',
	discord: {
		token: process.env.DISCORD_TOKEN!,
		id: process.env.CLIENT_ID!,
		secret: process.env.CLIENT_SECRET!,
		devServers: ['953375922990506005']
	},
	api: {
		port: parseInt(process.env.API_PORT!, 10)
	},
	db: {
		url: process.env.DATABASE_URL!
	},
	redis: {
		host: process.env.REDIS_HOST!,
		port: parseInt(process.env.REDIS_PORT!, 10),
		password: process.env.REDIS_PASS!
	},
	metrics: {
		port: parseInt(process.env.METRICS_PORT!, 10)
	},
	sentry: {
		dsn: process.env.SENTRY_DSN!
	}
};
