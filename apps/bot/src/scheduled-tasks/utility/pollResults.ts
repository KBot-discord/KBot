import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import type { PollResultPayload } from '#types/Tasks';

@ApplyOptions<ScheduledTask.Options>({
	name: 'pollResults'
})
export class UtilityTask extends ScheduledTask {
	public override async run({ guildId, pollId }: PollResultPayload): Promise<void> {
		await this.container.utility.polls.end(guildId, pollId);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface ScheduledTasks {
		pollResults: never;
	}
}
