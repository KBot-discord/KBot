import '@kbotdev/plugin-modules/register';
import '@sapphire/plugin-scheduled-tasks/register';
import '@sapphire/plugin-api/register';
import '#utils/Augments';
import '#hooks/register';

import { loadConfig } from '#config';
import { connectServer } from '#rpc/server';
import { KBotClient } from '#extensions/KBotClient';
import { ApplicationCommandRegistries, container, RegisterBehavior } from '@sapphire/framework';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

async function main(): Promise<void> {
	let client: KBotClient | undefined = undefined;

	try {
		const { discord, api, rpc } = container.config;

		client = new KBotClient();

		await client.login(discord.token);

		connectServer.listen(rpc.server.port, api.host, () => {
			container.logger.info(`Connect server started on ${api.host}:${rpc.server.port}`);
		});
	} catch (error: unknown) {
		container.logger.sentryError(error);

		await client?.destroy();
		connectServer.close();

		process.exit(1);
	}
}

void loadConfig();

void main();
