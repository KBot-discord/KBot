import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';
import type { ListenerErrorPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ListenerError
})
export class ErrorListener extends Listener<typeof Events.ListenerError> {
	public async run(error: Error, context: ListenerErrorPayload): Promise<void> {
		this.container.logger.sentryError(error, context);
	}
}
