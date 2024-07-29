import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { ContextMenuCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandSuccess,
})
export class CommandListener extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public run({ command }: ContextMenuCommandSuccessPayload): void {
		this.container.metrics.incrementCommand({
			command: command.name,
			success: true,
		});
	}
}
