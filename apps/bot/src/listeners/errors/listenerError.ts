import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: Events.ListenerError
})
export class ErrorListener extends Listener {
	public run(error: Error) {
		this.container.logger.error(error);
	}
}
