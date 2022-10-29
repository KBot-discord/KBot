import { Listener, ListenerOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Client } from 'discord.js';

@ApplyOptions<ListenerOptions>({ once: true })
export class ReadyListener extends Listener {
    public run(client: Client) {
        const { tag } = client.user!;
        this.container.logger.info(`${tag} is online.`);
    }
}