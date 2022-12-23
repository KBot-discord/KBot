import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { container } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ScheduledTask.Options>({
	name: 'pollResults'
})
export class PollResultsTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run({ messageId }: { messageId: string }) {
		return container.polls.endPoll(messageId);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		pollResults: never;
	}
}
