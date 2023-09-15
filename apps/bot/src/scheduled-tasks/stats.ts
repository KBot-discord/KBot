import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { fetch } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';

@ApplyOptions<ScheduledTask.Options>({
	name: 'statsTask',
	pattern: '*/30 * * * *', // Every 30 minutes
	enabled: !container.config.isDev
})
export class StatsTask extends ScheduledTask {
	public override async run(): Promise<void> {
		const { client, config } = this.container;

		const guildCount = client.guilds.cache.size;

		await fetch(`https://top.gg/api/bots/${config.discord.id}/stats`, {
			method: 'POST',
			headers: {
				'content-type': MimeTypes.ApplicationJson,
				authorization: config.stats.topgg
			},
			body: JSON.stringify({
				server_count: guildCount
			})
		}).catch(() => {});
	}
}
