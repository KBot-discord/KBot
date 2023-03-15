import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildScheduledEventDelete
})
export class GuildListener extends Listener {
	public async run(guildScheduledEvent: GuildScheduledEvent): Promise<void> {
		const { events } = this.container;

		if (guildScheduledEvent.channelId) {
			const settings = await events.getSettings(guildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const exists = await events.karaoke.eventExists({
				guildId: guildScheduledEvent.guildId,
				eventId: guildScheduledEvent.channelId
			});
			if (!exists) return;

			await events.karaoke.deleteScheduledEvent({
				guildId: guildScheduledEvent.guildId,
				eventId: guildScheduledEvent.channelId
			});
		}
	}
}
