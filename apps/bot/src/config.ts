import { envGetNumber, envGetString, validateConfig } from '#utils/config';
import { NodeEnvironments, mainFolder } from '#utils/constants';
import { container } from '@sapphire/framework';
import { config } from 'dotenv';
import { resolve } from 'path';
import type { ClientConfig } from '#types/Config';

export function loadConfig(): void {
	process.env.NODE_ENV ??= NodeEnvironments.Dev;

	config({ path: resolve(mainFolder, '../.env') });
	const isDev = envGetString('NODE_ENV') !== NodeEnvironments.Production;

	const clientConfig: ClientConfig = {
		isDev,
		discord: {
			token: envGetString('DISCORD_TOKEN'),
			id: envGetString('DISCORD_ID'),
			secret: envGetString('DISCORD_SECRET'),
			webhook: envGetString('DISCORD_WEBHOOK'),
			devServers: ['953375922990506005'],
			ownerIds: ['137657554200166401']
		},
		web: {
			url: envGetString('WEB_URL')
		},
		api: {
			host: envGetString('API_HOST'),
			port: envGetNumber('API_PORT'),
			auth: {
				cookie: envGetString('API_AUTH_COOKIE'),
				domain: envGetString('API_AUTH_DOMAIN')
			}
		},
		rpc: {
			server: {
				port: envGetNumber('RPC_SERVER_PORT')
			}
		},
		db: {
			url: envGetString('DATABASE_URL'),
			cacheExpiry: envGetNumber('DATABASE_CACHE_EXPIRY')
		},
		redis: {
			host: envGetString('REDIS_HOST'),
			port: envGetNumber('REDIS_PORT'),
			password: envGetString('REDIS_PASS')
		},
		meili: {
			host: envGetString('MEILI_HOST'),
			port: envGetNumber('MEILI_PORT'),
			apiKey: envGetString('MEILI_APIKEY')
		},
		holodex: {
			apiKey: envGetString('HOLODEX_KEY')
		},
		sentry: {
			dsn: envGetString('SENTRY_DSN')
		},
		stats: {
			topgg: envGetString('DISCORD_STATS_TOPGG')
		}
	};

	const valid = validateConfig(clientConfig);
	if (!valid) {
		throw new Error('Invalid config. Exiting.');
	}

	container.config = clientConfig;
}
