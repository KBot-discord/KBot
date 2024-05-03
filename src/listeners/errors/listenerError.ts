import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { ListenerErrorPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ListenerError
})
export class ErrorListener extends Listener<typeof Events.ListenerError> {
	public async run(error: Error, payload: ListenerErrorPayload): Promise<void> {
		const { name, event, location } = payload.piece;

		this.container.logger.sentryError(error, {
			message: `Encountered error on event listener "${name}" for event "${String(event)}" at path "${location.full}"`,
			context: payload
		});
	}
}
