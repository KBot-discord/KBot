import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { ContextMenuCommandDeniedPayload, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ContextMenuCommandDenied,
})
export class CommandListener extends Listener<typeof Events.ContextMenuCommandDenied> {
	public async run({ message }: UserError, { interaction }: ContextMenuCommandDeniedPayload): Promise<void> {
		await interaction.errorReply(message, {
			tryEphemeral: true,
		});
	}
}
