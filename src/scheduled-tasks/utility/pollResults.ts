import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { PollResultPayload } from '../../lib/types/Tasks.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'pollResults',
})
export class UtilityTask extends ScheduledTask {
	public override async run({ guildId, pollId }: PollResultPayload): Promise<void> {
		await this.container.utility.polls.end(guildId, pollId);
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		pollResults: { guildId: string; pollId: string };
	}
}
