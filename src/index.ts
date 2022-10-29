import '@sapphire/plugin-api/register';
import { KBotClient } from "./lib/KBotClient";
import { Config } from "./lib/types/config";
import { GatewayIntentBits } from "discord.js";
import startMetricsServer from "./lib/metrics";


const config: Config = require('../config.js');

const client = new KBotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildMessageReactions,
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
