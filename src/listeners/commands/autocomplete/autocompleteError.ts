import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { AutocompleteInteractionPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.CommandAutocompleteInteractionError,
})
export class CommandListener extends Listener<typeof Events.CommandAutocompleteInteractionError> {
	public run(error: Error, payload: AutocompleteInteractionPayload): void {
		const { name, location } = payload.command;

		this.container.logger.sentryError(error, {
			message: `Encountered error while handling an autocomplete run method on command "${name}" at path "${location.full}"`,
			context: payload,
		});
	}
}
