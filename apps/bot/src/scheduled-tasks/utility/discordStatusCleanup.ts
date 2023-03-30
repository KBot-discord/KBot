import { DISCORD_STATUS_BASE } from '#utils/constants';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import type { StatusPageResult } from '#types/DiscordStatus';

@ApplyOptions<ScheduledTask.Options>({
	name: 'discordStatusCleanup',
	pattern: '0 0 0 1 * *', // The first of every month
	enabled: !container.config.isDev
})
export class UtilityTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		try {
			const { incidents } = await fetch<StatusPageResult>(
				`${DISCORD_STATUS_BASE}/incidents.json`,
				{
					method: FetchMethods.Get
				},
				FetchResultTypes.JSON
			);

			const result = await this.container.prisma.discordIncident.deleteMany({
				where: { NOT: { id: { in: incidents.map((incident) => incident.id) } } }
			});
			this.container.logger.info(`[DiscordStatusCleanup] Cleaned up ${result.count} incidents`);
		} catch (error) {
			this.container.logger.error(`Error during discord incident cleanup task:\n`, error);
		}
	}
}
