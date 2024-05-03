import { KBotErrors } from '../../lib/types/Enums.js';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { InteractionResponseUnion } from '../../lib/types/Augments.js';
import type { ChannelPermissionsPayload } from '../../lib/types/Errors.js';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.ChannelPermissions
})
export class CustomListener extends Listener<typeof KBotErrors.ChannelPermissions> {
	public async run({ interaction, error }: ChannelPermissionsPayload): Promise<InteractionResponseUnion> {
		return await interaction.errorReply(error.userMessage, {
			tryEphemeral: true
		});
	}
}
