import { Events, Listener, UserError, type ChatInputCommandDeniedPayload } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Listener.Options>({
	name: Events.ChatInputCommandDenied
})
export class CommandDeniedListener extends Listener {
	public run(error: UserError, payload: ChatInputCommandDeniedPayload) {
		return payload.interaction.errorReply(error.message, true);
	}
}
