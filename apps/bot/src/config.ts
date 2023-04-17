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
			apiKey: envGetString('HOLODEX_KEY'),
			twitchConflicts: [
				'UCKQi12nOGZsJ5nOuCTHErmA', //
				'UCkDfBt3R64R2rRIrAQwldeQ',
				'UCMDaLlGAjEZze-AsGywXJtg',
				'UCo59TbTB8i1Xt41rE71ll4g',
				'UC3-Rfh_Ek-s6EUWS4fT5VPw',
				'UCSaZUKRGXwKLXTAl2_LMALQ',
				'UC2c8dQYdDadn7tmK_d7o-HQ'
			]
		},
		sentry: {
			dsn: envGetString('SENTRY_DSN')
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
