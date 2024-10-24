import { ApplyOptions } from '@sapphire/decorators';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { StatusPageResult } from '../../lib/types/DiscordStatus.js';
import { DISCORD_STATUS_BASE } from '../../lib/utilities/constants.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'discordStatusCleanup',
	pattern: '0 0 0 1 * *', // The first of every month
	enabled: container.config.enableTasks,
	customJobOptions: {
		jobId: 'tasks:discordStatusCleanup',
	},
})
export class UtilityTask extends ScheduledTask {
	public override async run(): Promise<void> {
		const { utility } = this.container;

		const { incidents } = await fetch<StatusPageResult>(
			`${DISCORD_STATUS_BASE}/incidents.json`,
			{
				method: FetchMethods.Get,
			},
			FetchResultTypes.JSON,
		);

		const count = await utility.incidents.cleanupIncidents(incidents.map((incident) => incident.id));

		this.container.logger.info(`[DiscordStatusCleanup] Cleaned up ${count} incidents`);
	}
}
