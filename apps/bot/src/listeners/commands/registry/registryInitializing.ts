import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { redBright } from 'colorette';

@ApplyOptions<Listener.Options>({
	event: Events.ApplicationCommandRegistriesInitialising,
	once: true
})
export class CommandListener extends Listener<typeof Events.ApplicationCommandRegistriesInitialising> {
	public run(): void {
		this.container.logger.info(`[${redBright('Command Registry')}] Initiailizing...`);
	}
}
