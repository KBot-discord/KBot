import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import {container, LogLevel} from "@sapphire/framework";

import {KBotClient} from "./lib/KBotClient";
import {Config} from "./lib/types/config";
import startMetricsServer from "./lib/util/metrics";


const config: Config = require('../config.js');
container.config = config;

const client = new KBotClient({
    intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_VOICE_STATES',
        'GUILD_SCHEDULED_EVENTS',
        'GUILD_MESSAGE_REACTIONS',
    ],
    api: {
        listenOptions: {
            port: config.api.port,
        },
    },
    logger: {
        level: process.env.NODE_ENV === 'production' ? LogLevel.Info : LogLevel.Debug,
    }
});

async function main() {
    try {
        startMetricsServer();
        await client.login(config.discord.token);
    } catch {
        await client.destroy();
    }
}

void main();
