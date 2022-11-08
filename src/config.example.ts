process.env.NODE_ENV ??= 'dev'; // Set env to dev if NODE_ENV is undefined

import type { Config, IdHints } from './lib/types/config';

const commandIds: IdHints = {
	dev: {
		// When you start the bot, Sapphire will log the registered command IDs. You need to save them here.
		// Example: ping: ['1035721679604809738']
		uwu: [],
		ping: [],
		user: [],
		echo: [],
		'add emote': [],
		help: [],
		pat: [],
		poll: [],
		permissions: [],
		karaoke: [],
		event: []
	},
	staging: {},
	production: {}
};

export const config: Config = {
	isDev: process.env.NODE_ENV !== 'production',
	discord: {
		token: process.env.DISCORD_TOKEN!,
		id: process.env.CLIENT_ID!,
		secret: process.env.CLIENT_SECRET!,
		idHints: commandIds[process.env.NODE_ENV!],
		devServers: [
			// Put the guild ID(s) for the server(s) that you will be testing in.
			// If nothing is entered, every command will be registered as a global commands.
		]
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
