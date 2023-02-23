import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandRunPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandRun
})
export class CommandListener extends Listener {
	public async run({ command }: ChatInputCommandRunPayload) {
		this.container.metrics.incrementCommand({
			command: command.name,
			value: 1
		});
	}
}
