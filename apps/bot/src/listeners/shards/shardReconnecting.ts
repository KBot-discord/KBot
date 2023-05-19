import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ShardReconnecting
})
export class ShardListener extends Listener<typeof Events.ShardReconnecting> {
	public override run(shardId: number): void {
		this.container.logger.info(`[Shard ${shardId}] reconnecting`);
	}
}
