import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { UserError, ChatInputCommandDeniedPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandDenied
})
export class CommandListener extends Listener {
	public run(error: UserError, payload: ChatInputCommandDeniedPayload) {
		return payload.interaction.errorReply(error.message, true);
	}
}
