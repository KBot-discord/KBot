import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { redBright } from 'colorette';

@ApplyOptions<Listener.Options>({
	event: Events.ShardReconnecting
})
export class ShardListener extends Listener<typeof Events.ShardReconnecting> {
	public override run(shardId: number): void {
		this.container.logger.info(`[${redBright(`Shard ${shardId}`)}] reconnecting`);
	}
}
