import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';
import type { CloseEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ShardDisconnect
})
export class ShardListener extends Listener<typeof Events.ShardDisconnect> {
	public override run(event: CloseEvent, shardId: number): void {
		this.container.logger.info(`[Shard ${shardId}] disconnected. code: ${event.code}`);
	}
}
