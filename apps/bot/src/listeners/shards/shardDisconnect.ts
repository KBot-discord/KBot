import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { redBright } from 'colorette';
import type { CloseEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ShardDisconnect
})
export class ShardListener extends Listener<typeof Events.ShardDisconnect> {
	public override run(event: CloseEvent, shardId: number): void {
		this.container.logger.info(`[${redBright(`Shard ${shardId}`)}] disconnected. code: ${event.code}`);
	}
}
