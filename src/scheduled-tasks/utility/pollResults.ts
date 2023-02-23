import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import type { PollResultPayload } from '#types/Tasks';

@ApplyOptions<ScheduledTask.Options>({
	name: 'pollResults'
})
export class PollTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run({ pollId }: PollResultPayload): Promise<void> {
		await this.container.utility.polls.end(pollId);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		pollResults: never;
	}
}
