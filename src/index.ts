// Register plugins
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';

// Imports
import { container, LogLevel } from "@sapphire/framework";
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { KBotClient } from "./lib/extensions/KBotClient";
import startMetricsServer from "./lib/util/metrics";
import { rootFolder } from "./lib/util/constants";
import { Intents } from "discord.js";
import { getConfig } from "./lib/util/config";


const config = getConfig();
if (!config) {
    console.error("Invalid config, exiting.")
    process.exit(1);
}

const client = new KBotClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    ],
    presence: {
        status: 'online',
        activities: [
            { name: '/help', type: 0 },
        ],
    },
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
