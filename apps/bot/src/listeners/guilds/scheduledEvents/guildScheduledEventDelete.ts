import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildScheduledEventDelete
})
export class GuildListener extends Listener {
	public async run(guildScheduledEvent: GuildScheduledEvent): Promise<void> {
		const { events } = this.container;

		if (guildScheduledEvent.channelId) {
			const settings = await events.settings.get(guildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const exists = await events.karaoke.eventExists(guildScheduledEvent.guildId, guildScheduledEvent.channelId);
			if (!exists) return;

			await events.karaoke.deleteScheduledEvent(guildScheduledEvent.guildId, guildScheduledEvent.channelId);
		}
	}
}
