import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { InteractionHandlerParseError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.InteractionHandlerParseError
})
export class ErrorListener extends Listener<typeof Events.InteractionHandlerParseError> {
	public async run(error: Error, payload: InteractionHandlerParseError): Promise<void> {
		const { name, location } = payload.handler;

		this.container.logger.sentryError(error, {
			message: `Encountered error while handling an interaction handler parse method for interaction-handler "${name}" at path "${location.full}"`,
			context: payload
		});
	}
}
