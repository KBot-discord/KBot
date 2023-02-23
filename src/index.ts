import '@kbotdev/plugin-modules/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-logger/register';
import './lib/util/Augments';

import { loadConfig } from './config';
import { KBotClient } from '#lib/extensions/KBotClient';
import { ApplicationCommandRegistries, container, RegisterBehavior } from '@sapphire/framework';

loadConfig();

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

async function main() {
	let client: KBotClient | undefined = undefined;
	try {
		const config = await KBotClient.preLogin();

		client = new KBotClient(config);

		await client.login(container.config.discord.token);
	} catch (error) {
		container.logger.fatal(error);
		await client?.destroy();
		process.exitCode = 1;
	}
}

void main();
