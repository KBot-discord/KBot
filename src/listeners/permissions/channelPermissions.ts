import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { KBotErrors } from '../../lib/util/constants';
import type { Payload } from '../../lib/types/Errors';

@ApplyOptions<Listener.Options>({
	name: KBotErrors.ChannelPermissions
})
export class ChannelPermissionsListener extends Listener {
	public run({ interaction, error }: Payload<KBotErrors.ChannelPermissions>) {
		return interaction.errorReply(error.message);
	}
}
