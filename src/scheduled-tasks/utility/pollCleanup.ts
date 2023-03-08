import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import dayjs from 'dayjs';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 0 12 * * *' // Every day at 12pm
})
export class PollTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const date = dayjs().add(1, 'month').toDate();

		const result = await this.container.prisma.poll.deleteMany({
			where: { createdAt: { lte: date } }
		});
		this.container.logger.info(`[PollCleanup] Cleaned up ${result.count} polls`);
	}
}
