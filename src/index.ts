import '@kbotdev/plugin-modules/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';

import './lib/util/augments';

import { container, LogLevel } from '@sapphire/framework';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { Intents } from 'discord.js';
import { KBotClient } from './lib/extensions/KBotClient';
import { startMetricsServer } from './lib/util/metrics';
import { rootFolder } from './lib/util/constants';
import { getConfig } from './lib/util/config';
import { isNullish } from '@sapphire/utilities';

const config = getConfig();
if (isNullish(config)) {
	console.error('Invalid config, exiting.');
	process.exit(1);
}

const client = new KBotClient({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS],
	presence: {
		status: 'online',
		activities: [{ name: '/help', type: 0 }]
	},
	logger: {
		level: config.isDev ? LogLevel.Debug : LogLevel.Info
	},
	api: {
		listenOptions: {
			port: config.api.port
		}
	},
	tasks: {
		strategy: new ScheduledTaskRedisStrategy({
			bull: {
				connection: {
					host: config.redis.host,
					port: config.redis.port,
					password: config.redis.password
				},
				defaultJobOptions: { removeOnComplete: 0, removeOnFail: 0 }
			}
		})
	},
	modules: {
		enabled: true,
		loadModuleErrorListeners: true
	}
});

async function main() {
	if (!config!.isDev && config!.sentry.dsn) {
		Sentry.init({
			dsn: config!.sentry.dsn,
			integrations: [
				new Sentry.Integrations.Modules(),
				new Sentry.Integrations.FunctionToString(),
				new Sentry.Integrations.LinkedErrors(),
				new Sentry.Integrations.Console(),
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				new RewriteFrames({ root: rootFolder })
			]
		});
	}

	try {
		startMetricsServer();
		await client.login(config!.discord.token);
	} catch (error) {
		container.logger.error(error);
		await client.destroy();
		process.exit(1);
	}
}

void main();
