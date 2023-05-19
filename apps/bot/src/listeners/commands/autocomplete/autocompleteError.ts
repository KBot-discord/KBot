import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { AutocompleteInteractionPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.CommandAutocompleteInteractionError
})
export class CommandListener extends Listener<typeof Events.CommandAutocompleteInteractionError> {
	public async run(error: Error, payload: AutocompleteInteractionPayload): Promise<void> {
		this.container.logger.sentryError(error, payload);

		await payload.interaction.respond([]);
	}
}
