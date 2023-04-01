import { ApplyOptions } from '@sapphire/decorators';
import { Listener, container, Events } from '@sapphire/framework';
import { captureException } from '@sentry/node';

@ApplyOptions({
	name: Events.ListenerError,
	enabled: !container.config.isDev
})
export class ErrorListener extends Listener {
	public run(error: Error) {
		captureException(error);
	}
}
