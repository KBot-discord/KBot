import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ContextMenuCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandSuccess
})
export class MetricsListener extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public async run({ command }: ContextMenuCommandSuccessPayload): Promise<void> {
		this.container.metrics.incrementCommand({
			command: command.name,
			success: true
		});
	}
}
