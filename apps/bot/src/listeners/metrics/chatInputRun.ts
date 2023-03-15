import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandContext } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandRun
})
export class MetricsListener extends Listener {
	public async run({ commandName }: ChatInputCommandContext) {
		this.container.metrics.incrementCommand({
			command: commandName
		});
	}
}
