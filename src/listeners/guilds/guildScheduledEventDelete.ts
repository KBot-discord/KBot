import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, GuildScheduledEventEntityType } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildScheduledEventDelete
})
export class GuildListener extends Listener {
	public async run(guildScheduledEvent: GuildScheduledEvent): Promise<void> {
		const { events } = this.container;

		if (guildScheduledEvent.channelId && guildScheduledEvent.entityType === GuildScheduledEventEntityType.StageInstance) {
			const settings = await events.getSettings(guildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const active = await events.karaoke.isEventActive(guildScheduledEvent.guildId, guildScheduledEvent.channelId);
			if (active) return;

			await events.karaoke.deleteEvent(guildScheduledEvent.channelId);
		}
	}
}
