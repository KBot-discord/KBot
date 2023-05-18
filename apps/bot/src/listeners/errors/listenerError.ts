import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ListenerError
})
export class ErrorListener extends Listener {
	public async run(error: Error): Promise<void> {
		this.container.logger.error(error);
	}
}
