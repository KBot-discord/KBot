// Imports
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import { container, LogLevel } from "@sapphire/framework";
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { KBotClient } from "./lib/extensions/KBotClient";
import { Config } from "./lib/types/config";
import startMetricsServer from "./lib/util/metrics";
import { rootFolder } from "./lib/util/constants";


const config: Config = require('../config.js');
// if (config is not valid) process.exit(1);
container.config = config;

const client = new KBotClient({
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_VOICE_STATES',
        'GUILD_SCHEDULED_EVENTS',
    ],
    api: {
        listenOptions: {
            port: config.api.port,
        },
    },
    logger: {
        level: config.isDev ? LogLevel.Debug : LogLevel.Info,
    }
});

async function main() {
    if (config.sentry.enable) {
        Sentry.init({
            dsn: config.sentry.dsn,
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
        // container.db = await connect();
        await client.login(config.discord.token);
    } catch (error) {
        container.logger.error(error);
        await client.destroy();
        process.exit(1);
    }
}

void main();
