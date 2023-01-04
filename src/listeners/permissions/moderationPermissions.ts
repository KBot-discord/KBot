import { KBotErrors } from '#utils/constants';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Payload } from '#lib/types/Errors';

@ApplyOptions<Listener.Options>({
	name: KBotErrors.ModerationPermissions
})
export class ChannelPermissionsListener extends Listener {
	public run({ interaction, error }: Payload<KBotErrors.ChannelPermissions>) {
		return interaction.errorReply(error.message);
	}
}
