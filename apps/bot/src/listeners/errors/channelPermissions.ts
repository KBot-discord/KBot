import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Payload } from '#types/Errors';

@ApplyOptions<Listener.Options>({
	name: KBotErrors.ChannelPermissions
})
export class ErrorListener extends Listener {
	public run({ interaction, error }: Payload<KBotErrors.ChannelPermissions>) {
		return interaction.errorReply(error.message, true);
	}
}
