import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { CloseEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ShardDisconnect
})
export class ShardListener extends Listener<typeof Events.ShardDisconnect> {
	public override run(event: CloseEvent, shardId: number): void {
		this.container.logger.infoTag(`Shard ${shardId}`, `Disconnected. code: ${event.code}`);
	}
}
