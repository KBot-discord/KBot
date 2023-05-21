import { KBotErrors } from '#types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChannelPermissionsPayload } from '#types/Errors';
import type { InteractionResponseUnion } from '#types/Augments';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.ChannelPermissions
})
export class ErrorListener extends Listener<typeof KBotErrors.ChannelPermissions> {
	public async run({ interaction, error }: ChannelPermissionsPayload): Promise<InteractionResponseUnion> {
		return interaction.errorReply(error.userMessage, true);
	}
}
