import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { VoiceState } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.VoiceStateUpdate
})
export class ReadyListener extends Listener {
	public run(oldState: VoiceState, newState: VoiceState) {
		if (!oldState.channel?.type) {
			return;
		}
		if (oldState.suppress && !newState.suppress) {
		} // Ignore weird double-fire events
	}
}
