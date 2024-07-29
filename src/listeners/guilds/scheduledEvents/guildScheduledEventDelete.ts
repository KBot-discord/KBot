import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import { Events } from 'discord.js';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildScheduledEventDelete,
})
export class GuildListener extends Listener<typeof Events.GuildScheduledEventDelete> {
	public async run(guildScheduledEvent: GuildScheduledEvent): Promise<void> {
		const { events } = this.container;

		if (guildScheduledEvent.channelId) {
			const settings = await events.settings.get(guildScheduledEvent.guildId);
			if (isNullOrUndefined(settings) || !settings.enabled) return;

			const event = await events.karaoke.getEvent(guildScheduledEvent.channelId);
			if (isNullOrUndefined(event) || event.isActive) return;

			await events.karaoke.deleteEvent(guildScheduledEvent.channelId);
		}
	}
}
