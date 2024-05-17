import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { InteractionResponseUnion } from '../../lib/types/Augments.js';
import { KBotErrors } from '../../lib/types/Enums.js';
import type { ChannelPermissionsPayload } from '../../lib/types/Errors.js';

@ApplyOptions<Listener.Options>({
	event: KBotErrors.ChannelPermissions,
})
export class CustomListener extends Listener<typeof KBotErrors.ChannelPermissions> {
	public async run({ interaction, error }: ChannelPermissionsPayload): Promise<InteractionResponseUnion> {
		return await interaction.errorReply(error.userMessage, {
			tryEphemeral: true,
		});
	}
}
