import '@kbotdev/plugin-modules/register';
import '@sapphire/plugin-scheduled-tasks/register';
import '@sapphire/plugin-api/register';
import '#plugins/register';
import '#utils/Augments';

import { loadConfig } from '#config';
import { KBotClient } from '#extensions/KBotClient';
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

void loadConfig();

void main();
