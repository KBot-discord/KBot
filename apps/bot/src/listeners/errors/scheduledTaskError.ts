import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<Listener.Options>({
	event: ScheduledTaskEvents.ScheduledTaskError
})
export class ErrorListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public async run(error: unknown, task: string, payload: unknown): Promise<void> {
		const taskPiece = this.container.stores.get('scheduled-tasks').get('task');

		let message = `Encountered error on scheduled task "${task}"`;
		if (taskPiece) message += ` at path "${taskPiece.location.full}"`;

		this.container.logger.sentryError(error, { message, context: { task, payload } });
	}
}
