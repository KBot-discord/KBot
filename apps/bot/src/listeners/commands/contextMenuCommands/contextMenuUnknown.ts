import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { UnknownContextMenuCommandPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.UnknownContextMenuCommand
})
export class CommandListener extends Listener<typeof Events.UnknownContextMenuCommand> {
	public async run(payload: UnknownContextMenuCommandPayload): Promise<void> {
		this.container.logger.sentryMessage('Unknown context menu command', payload);

		await payload.interaction.errorReply('I was not able to find the command you were trying to run.', {
			tryEphemeral: true
		});
	}
}
