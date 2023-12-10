import { KBotErrors } from '#lib/types/Enums';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChannelPermissionsPayload } from '#lib/types/Errors';
import type { InteractionResponseUnion } from '#lib/types/Augments';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.ChannelPermissions
})
export class CustomListener extends Listener<typeof KBotErrors.ChannelPermissions> {
	public async run({ interaction, error }: ChannelPermissionsPayload): Promise<InteractionResponseUnion> {
		return interaction.errorReply(error.userMessage, {
			tryEphemeral: true
		});
	}
}
