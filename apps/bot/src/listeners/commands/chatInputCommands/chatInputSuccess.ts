import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandSuccess
})
export class MetricsListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public async run({ command }: ChatInputCommandSuccessPayload): Promise<void> {
		this.container.metrics.incrementCommand({
			command: command.name,
			success: true
		});
	}
}
