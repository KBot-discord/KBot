import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { AutocompleteInteractionPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.CommandAutocompleteInteractionError
})
export class CommandListener extends Listener<typeof Events.CommandAutocompleteInteractionError> {
	public async run(error: Error, payload: AutocompleteInteractionPayload): Promise<void> {
		const { name, location } = payload.command;

		this.container.logger.sentryError(error, {
			message: `Encountered error while handling an autocomplete run method on command "${name}" at path "${location.full}"`,
			context: payload
		});
	}
}
