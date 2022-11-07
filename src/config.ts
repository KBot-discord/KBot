import type { IdHints } from './lib/types/config';

const commandIds: IdHints = {
	dev: {
		uwu: ['1035728422854467634'],
		ping: ['1035721679604809738'],
		user: ['1035784234377416734'],
		echo: ['1035943944569225368'],
		'add emote': ['1037024438350254200'],
		help: ['1036723541049085993'],
		pat: ['1037026182975193132'],
		poll: ['1036859625418530856'],
		permissions: ['1038259858895552532'],
		karaoke: ['1038252639810494474'],
		event: ['1038259859797323856']
	},
	staging: {
		uwu: ['1035810693133373540'],
		ping: ['1035810693787684895'],
		user: ['1035810694530084915'],
		echo: ['1036013816951099402'],
		'add emote': ['1036013815189491772']
	},
	production: {}
};

export const config = {
	isDev: process.env.NODE_ENV !== 'production',
	discord: {
		token: process.env.DISCORD_TOKEN,
		id: process.env.CLIENT_ID!,
		secret: process.env.CLIENT_SECRET,
		idHints: commandIds[process.env.NODE_ENV!],
		devServers: ['953375922990506005']
	},
	api: {
		port: parseInt(process.env.API_PORT!, 10)
	},
	db: {
		url: process.env.DATABASE_URL
	},
	redis: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT!, 10),
		password: process.env.REDIS_PASS
	},
	metrics: {
		port: process.env.METRICS_PORT
	},
	sentry: {
		dsn: process.env.SENTRY_DSN
	}
};
