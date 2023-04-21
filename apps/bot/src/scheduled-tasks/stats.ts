import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { fetch } from '@sapphire/fetch';

@ApplyOptions<ScheduledTask.Options>({
	name: 'statsTask',
	pattern: '*/30 * * * *', // Every 30 minutes
	enabled: !container.config.isDev
})
export class StatsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const { client, config } = this.container;

		if (!client.isReady()) return;

		const shardCount = client.shard?.count ?? 1;
		const guildCount = client.guilds.cache.size;

		await fetch(`https://top.gg/api/bots/${config.discord.id}/stats`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: config.stats.topgg
			},
			body: JSON.stringify({
				shard_count: shardCount,
				server_count: guildCount
			})
		});
	}
}
