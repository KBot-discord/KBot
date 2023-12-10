import { DISCORD_STATUS_BASE } from '#utils/constants';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import type { StatusPageResult } from '#types/DiscordStatus';

@ApplyOptions<ScheduledTask.Options>({
	name: 'discordStatusCleanup',
	pattern: '0 0 0 1 * *', // The first of every month
	enabled: container.config.enableTasks
})
export class UtilityTask extends ScheduledTask {
	public override async run(): Promise<void> {
		const { utility } = this.container;

		const { incidents } = await fetch<StatusPageResult>(
			`${DISCORD_STATUS_BASE}/incidents.json`,
			{
				method: FetchMethods.Get
			},
			FetchResultTypes.JSON
		);

		const count = await utility.incidents.cleanupIncidents(incidents.map((incident) => incident.id));

		this.container.logger.info(`[DiscordStatusCleanup] Cleaned up ${count} incidents`);
	}
}
