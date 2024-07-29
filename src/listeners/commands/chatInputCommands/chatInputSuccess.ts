import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { ChatInputCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandSuccess,
})
export class CommandListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public run({ command }: ChatInputCommandSuccessPayload): void {
		this.container.metrics.incrementCommand({
			command: command.name,
			success: true,
		});
	}
}
