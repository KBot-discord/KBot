import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ContextMenuCommandRunPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandRun
})
export class MetricsListener extends Listener {
	public async run({ command }: ContextMenuCommandRunPayload): Promise<void> {
		this.container.metrics.incrementCommand({
			command: command.name
		});
	}
}
