import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, GuildScheduledEventEntityType, GuildScheduledEventStatus } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildScheduledEventUpdate
})
export class GuildListener extends Listener {
	public async run(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent): Promise<void> {
		const { events, validator } = this.container;

		if (isNullish(oldGuildScheduledEvent.channel) || isNullish(oldGuildScheduledEvent.guild)) return;

		if (
			oldGuildScheduledEvent.entityType !== GuildScheduledEventEntityType.External &&
			newGuildScheduledEvent.entityType === GuildScheduledEventEntityType.External
		) {
			const {
				guildId,
				channel: { id: eventId }
			} = oldGuildScheduledEvent;
			const settings = await events.settings.get(newGuildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const exists = await events.karaoke.eventExists(guildId, eventId);
			if (!exists) return;

			const active = await events.karaoke.eventActive(guildId, eventId);
			if (active) return;

			await events.karaoke.deleteEvent(oldGuildScheduledEvent.channel.id);
			return;
		}

		if (
			oldGuildScheduledEvent.status === GuildScheduledEventStatus.Scheduled && //
			newGuildScheduledEvent.status === GuildScheduledEventStatus.Active
		) {
			const {
				guildId,
				channel: { id: eventId }
			} = oldGuildScheduledEvent;
			const result = await validator.client.hasChannelPermissions(oldGuildScheduledEvent.channel, [
				PermissionFlagsBits.ManageEvents,
				PermissionFlagsBits.MuteMembers,
				PermissionFlagsBits.MoveMembers,
				PermissionFlagsBits.ManageChannels
			]);
			if (!result) return;

			const settings = await events.settings.get(newGuildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const exists = await events.karaoke.eventExists(guildId, eventId);
			if (!exists) return;

			const active = await events.karaoke.eventActive(guildId, eventId);
			if (active) return;

			const event = await events.karaoke.getEvent(oldGuildScheduledEvent.channel.id);
			if (isNullish(event)) return;

			await events.karaoke.startScheduledEvent(oldGuildScheduledEvent.guild, event, oldGuildScheduledEvent.name);
		}
	}
}
