import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { UserError, ChatInputCommandDeniedPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandDenied
})
export class CommandListener extends Listener {
	public async run(error: UserError, payload: ChatInputCommandDeniedPayload): Promise<void> {
		await payload.interaction.errorReply(error.message, true);
	}
}
