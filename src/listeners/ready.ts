import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { KBotClient } from '#lib/extensions/KBotClient';

@ApplyOptions<Listener.Options>({
	name: 'ready',
	once: true
})
export class ReadyListener extends Listener {
	public run(client: KBotClient) {
		this.container.logger.info(`${client.user!.tag} is online.`);
	}
}
