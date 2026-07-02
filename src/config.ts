import { resolve } from 'node:path';
import { container } from '@sapphire/framework';
import { config } from 'dotenv';
import type { ClientConfig } from './lib/types/Config.js';
import { envGetNumber, envGetString, validateConfig } from './lib/utilities/config.js';
import { mainFolder, NodeEnvironments } from './lib/utilities/constants.js';

export function loadConfig(): void {
	process.env.NODE_ENV ??= NodeEnvironments.Dev;

	config({ path: resolve(mainFolder, '../.env') });
	const env = envGetString('NODE_ENV');
	const isDev =
		env !== NodeEnvironments.Production && //
		env !== NodeEnvironments.Staging;

	const clientConfig: ClientConfig = {
		env,
		isDev,
		discord: {
			token: envGetString('DISCORD_TOKEN'),
			id: envGetString('DISCORD_ID'),
			secret: envGetString('DISCORD_SECRET'),
			devServers: ['953375922990506005'],
			ownerIds: ['137657554200166401'],
		},
		api: {
			host: envGetString('API_HOST'),
			port: envGetNumber('API_PORT'),
		},
	};

	const valid = validateConfig(clientConfig);
	if (!valid) {
		throw new Error('Invalid config. Exiting.');
	}

	container.config = clientConfig;
}
