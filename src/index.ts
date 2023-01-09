import '@kbotdev/plugin-modules/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import './lib/util/Augments';

import { KBotClient } from '#lib/extensions/KBotClient';
import { startMetricsServer } from '#utils/metrics';
import { rootFolder } from '#utils/constants';
import { getConfig } from '#utils/config';
import * as Sentry from '@sentry/node';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import { container, LogLevel } from '@sapphire/framework';
import { RewriteFrames } from '@sentry/integrations';
import { IntentsBitField } from 'discord.js';
import { isNullish } from '@sapphire/utilities';

const config = getConfig();
if (isNullish(config)) {
	console.error('Invalid config, exiting.');
	process.exit(1);
}

const client = new KBotClient({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildVoiceStates,
		IntentsBitField.Flags.GuildScheduledEvents
	],
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
