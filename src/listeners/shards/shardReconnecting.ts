import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ShardReconnecting,
})
export class ShardListener extends Listener<typeof Events.ShardReconnecting> {
	public override run(shardId: number): void {
		this.container.logger.infoTag(`Shard ${shardId}`, 'Reconnecting.');
	}
}
