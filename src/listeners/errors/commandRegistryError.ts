import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Command } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.CommandApplicationCommandRegistryError
})
export class ErrorListener extends Listener<typeof Events.CommandApplicationCommandRegistryError> {
	public run(error: Error, command: Command): void {
		const { name, location } = command;

		this.container.logger.sentryError(error, {
			message: `Encountered error while handling the command application command registry for command "${name}" at path "${location.full}"`,
			context: command
		});
	}
}
