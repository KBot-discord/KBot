import { ApplyOptions } from '@sapphire/decorators';
import { Listener, container } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { captureException } from '@sentry/node';

@ApplyOptions({
	name: ScheduledTaskEvents.ScheduledTaskError,
	enabled: !container.config.isDev
})
export class ErrorListener extends Listener {
	public run(error: Error) {
		captureException(error);
	}
}
