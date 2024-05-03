import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandDeniedPayload, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: Events.ChatInputCommandDenied
})
export class CommandListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public async run({ message }: UserError, { interaction }: ChatInputCommandDeniedPayload): Promise<void> {
		await interaction.errorReply(message, {
			tryEphemeral: true
		});
	}
}
