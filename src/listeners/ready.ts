// Imports
import { Listener, ListenerOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

// Types
import type { Client } from 'discord.js';


@ApplyOptions<ListenerOptions>({
    event: 'ready',
    once: true,
})

export class ReadyListener extends Listener {
    public run(client: Client) {
        const { tag } = client.user!;
        this.container.logger.info(`${tag} is online.`);
    }
}
