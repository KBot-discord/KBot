import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { InteractionHandlerError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.InteractionHandlerError
})
export class ErrorListener extends Listener<typeof Events.InteractionHandlerError> {
	public async run(error: Error, payload: InteractionHandlerError): Promise<void> {
		const { name, location } = payload.handler;

		this.container.logger.sentryError(error, {
			message: `Encountered error while handling an interaction handler run method for interaction-handler "${name}" at path "${location.full}"`,
			context: payload
		});
	}
}
