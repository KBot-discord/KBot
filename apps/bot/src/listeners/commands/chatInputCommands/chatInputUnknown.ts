import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { UnknownChatInputCommandPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.UnknownChatInputCommand
})
export class CommandListener extends Listener<typeof Events.UnknownChatInputCommand> {
	public async run(payload: UnknownChatInputCommandPayload): Promise<void> {
		this.container.logger.sentryMessage('Unknown chat input command', payload);

		await payload.interaction.errorReply('I was not able to find the command you were trying to run.', {
			tryEphemeral: true
		});
	}
}
