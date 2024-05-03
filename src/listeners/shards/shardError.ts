import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ShardError
})
export class ShardListener extends Listener<typeof Events.ShardError> {
	public override run(error: Error, shardId: number): void {
		this.container.logger.sentryError(error, { context: shardId });
	}
}
