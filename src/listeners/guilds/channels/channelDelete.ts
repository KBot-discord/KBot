import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { DMChannel, NonThreadGuildBasedChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ChannelDelete,
})
export class GuildListener extends Listener<typeof Events.ChannelDelete> {
	public async run(channel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
		if (channel.isVoiceBased()) {
			await this.container.events.karaoke.deleteEvent(channel.id);
		}
	}
}
