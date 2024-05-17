import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ApplicationCommandRegistriesInitialising,
	once: true,
})
export class CommandListener extends Listener<typeof Events.ApplicationCommandRegistriesInitialising> {
	public run(): void {
		this.container.logger.infoTag('Command Registry', 'Initiailizing...');
	}
}
