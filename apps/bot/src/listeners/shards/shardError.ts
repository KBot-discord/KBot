import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ShardError
})
export class ShardListener extends Listener<typeof Events.ShardError> {
	public override run(error: Error, shardId: number): void {
		this.container.logger.sentryError(error, { shardId });
	}
}
