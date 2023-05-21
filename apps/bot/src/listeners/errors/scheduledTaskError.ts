import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import type { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<Listener.Options>({
	event: ScheduledTaskEvents.ScheduledTaskError
})
export class ErrorListener extends Listener {
	public async run(error: Error, task: ScheduledTask, payload: unknown): Promise<void> {
		const { name, location } = task;

		this.container.logger.sentryError(error, {
			message: `Encountered error on scheduled task "${name}" at path "${location.full}"`,
			context: { task, payload }
		});
	}
}
