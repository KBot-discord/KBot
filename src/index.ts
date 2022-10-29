import '@sapphire/plugin-api/register';
import { KBotClient } from "./lib/KBotClient";
import { Config } from "./lib/types/config";
import startMetricsServer from "./lib/metrics";


const config: Config = require('../config.js');

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
});

async function main() {
    startMetricsServer();
    await client.login(config.discord.token);
}

void main();
