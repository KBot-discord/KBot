// Imports
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';

@ApplyOptions<ScheduledTask.Options>({
	bullJobsOptions: {
		removeOnComplete: true
	}
})
export class PollsResultsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run({ channelId, messageId }: { channelId: string; messageId: string }) {
		return container.polls.endPoll(channelId, messageId);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		pollResults: never;
	}
}
