import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 0 12 * * ?' // Every day at 12pm
})
export class PollTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const date = new Date();
		date.setDate(date.getMonth() + 1);

		await this.container.prisma.poll.deleteMany({
			where: { createdAt: { gte: date } }
		});
	}
}
