import '@kbotdev/plugin-modules/register';
import '@sapphire/plugin-scheduled-tasks/register';
import '@sapphire/plugin-api/register';
import './plugins/register.js';
import './lib/utilities/Augments.js';

import { KBotClient } from './lib/extensions/KBotClient.js';
import { loadConfig } from './config.js';
import { ApplicationCommandRegistries, RegisterBehavior, container } from '@sapphire/framework';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

async function main(): Promise<void> {
	let client: KBotClient | undefined = undefined;

	try {
		const { discord } = container.config;

		client = new KBotClient();

		await client.login(discord.token);
	} catch (error: unknown) {
		container.logger.sentryError(error);

		await client?.destroy();
		process.exit(1);
	}
}

loadConfig();

void main();
