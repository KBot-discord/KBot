import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { UserError, ContextMenuCommandDeniedPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: Events.ContextMenuCommandDenied
})
export class CommandListener extends Listener {
	public run(error: UserError, payload: ContextMenuCommandDeniedPayload) {
		return payload.interaction.errorReply(error.message, true);
	}
}
