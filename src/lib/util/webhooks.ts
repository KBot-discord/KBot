import type { TextChannel } from 'discord.js';

export async function getWebhook(channel: TextChannel, whName: string) {
	let webhook = await channel.fetchWebhooks().then((webhooks) => {
		return webhooks.find((wh) => wh.name.toLowerCase() === whName);
	});

	if (!webhook) {
		webhook = await channel.createWebhook(whName, { reason: 'Creating a webhook for notifications' });
	}
	return webhook;
}
