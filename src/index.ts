// Register plugins
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';

// Imports
import { container, LogLevel } from '@sapphire/framework';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { Intents } from 'discord.js';
import { KBotClient } from './lib/extensions/KBotClient';
import { startMetricsServer } from './lib/util/metrics';
import { rootFolder } from './lib/util/constants';
import { getConfig } from './lib/util/config';

const config = getConfig();
if (!config) {
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
		level: LogLevel.Debug
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
				}
			}
		})
	}
});

async function main() {
	if (config!.sentry.enable) {
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
