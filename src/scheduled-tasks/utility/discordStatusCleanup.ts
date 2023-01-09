import { DISCORD_STATUS_BASE } from '#utils/constants';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import type { StatusPageResult } from '#lib/types/DiscordStatus';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 0 0 1 * ?' // The first of every month
})
export class DiscordStatusTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run() {
		try {
			const { incidents } = (await fetch(`${DISCORD_STATUS_BASE}/incidents.json`).then((res) => res.json())) as StatusPageResult;

			await container.db.discordIncident.deleteMany({
				where: { NOT: { id: { in: incidents.map((i) => i.id) } } }
			});
		} catch (error) {
			container.logger.error(`Error during discord incident cleanup task:\n`, error);
		}
	}
}
