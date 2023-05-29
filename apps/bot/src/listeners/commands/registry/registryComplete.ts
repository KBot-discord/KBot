import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { redBright } from 'colorette';
import type { ApplicationCommandRegistry } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ApplicationCommandRegistriesRegistered,
	once: true
})
export class CommandListener extends Listener<typeof Events.ApplicationCommandRegistriesRegistered> {
	public run(registries: Map<string, ApplicationCommandRegistry>, duration: number): void {
		this.container.logger.info(`[${redBright('Command Registry')}] Took ${duration}ms to initialize ${registries.size} commands.`);
	}
}
