import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { UserError, ContextMenuCommandDeniedPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandDenied
})
export class CommandListener extends Listener {
	public async run(error: UserError, payload: ContextMenuCommandDeniedPayload): Promise<void> {
		await payload.interaction.errorReply(error.message, true);
	}
}
