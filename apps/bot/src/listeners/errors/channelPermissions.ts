import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Payload } from '#types/Errors';
import type { InteractionResponseUnion } from '#types/Augments';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.ChannelPermissions
})
export class ErrorListener extends Listener {
	public async run({ interaction, error }: Payload<KBotErrors.ChannelPermissions>): Promise<InteractionResponseUnion> {
		return interaction.errorReply(error.message, true);
	}
}
