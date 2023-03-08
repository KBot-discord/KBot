import { envGetNumber, envGetString, validateConfig } from '#utils/config';
import { NodeEnvironments } from '#utils/constants';
import { CommandOptionsRunTypeEnum, container } from '@sapphire/framework';
import dotenv from 'dotenv';
import { CommandConfigOptionsStrategy } from '@kbotdev/plugin-modules';
import { resolve } from 'path';
import type { ClientConfig } from '#types/Config';
import type { ModuleConfig } from '@kbotdev/plugin-modules';

export function loadConfig(): void {
	process.env.NODE_ENV ??= NodeEnvironments.Dev;

	dotenv.config({ path: resolve(__dirname, '../.env') });

	const isDev = envGetString('NODE_ENV') !== NodeEnvironments.Production;

	const clientConfig: ClientConfig = {
		isDev,
		discord: {
			token: envGetString('DISCORD_TOKEN'),
			id: envGetString('DISCORD_ID'),
			secret: envGetString('DISCORD_SECRET'),
			devServers: [] // isDev ? ['953375922990506005', '965896749317226496'] : []
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
		observability: {
			metrics: {
				port: envGetNumber('METRICS_PORT')
			}
		},
		sentry: {
			dsn: envGetString('SENTRY_DSN')
		},
		deepl: {
			key: envGetString('DEEPL_AUTH')
		},
		twitch: {
			id: envGetString('TWITCH_ID'),
			secret: envGetString('TWITCH_SECRET'),
			bearer: envGetString('TWITCH_BEARER'),
			callback: envGetString('TWITCH_CALLBACK')
		},
		youtube: {
			apiKey: envGetString('YOUTUBE_APIKEY'),
			pubsub: {
				secret: envGetString('YOUTUBE_PUBSUB_SECRET')
			}
		},
		premium: {
			patreon: {
				clientId: envGetString('PREMIUM_PATREON_ID'),
				clientSecret: envGetString('PREMIUM_PATREON_SECRET'),
				accessToken: envGetString('PREMIUM_PATREON_ACCESS'),
				refreshToken: envGetString('PREMIUM_PATREON_REFRESH')
			}
		}
	};

	const valid = validateConfig(clientConfig);
	if (!valid) {
		throw new Error('Invalid config. Exiting.');
	}

	container.config = clientConfig;
}

export const moduleConfig: ModuleConfig = {
	commands: {
		strategy: CommandConfigOptionsStrategy.Overwrite,
		options: {
			runIn: [CommandOptionsRunTypeEnum.GuildAny]
		}
	}
};
