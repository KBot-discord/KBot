// Imports
import { Listener, Piece, Store } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Client } from 'discord.js';
import { initMetrics } from '../lib/util/metrics';

@ApplyOptions<Listener.Options>({
	name: 'ready',
	once: true
})
export class ReadyListener extends Listener {
	public run(client: Client) {
		initMetrics();
		this.container.logger.info(`${client.user!.tag} is online.`);
		this.printStoreDebugInformation();
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];

		for (const store of stores) {
			logger.info(this.styleStore(store));
		}
	}

	private styleStore(store: Store<Piece>) {
		return `├─ Loaded ${store.size.toString().padEnd(3, ' ')} ${store.name}.`;
	}
}
