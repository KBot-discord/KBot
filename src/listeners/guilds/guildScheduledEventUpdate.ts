import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, GuildScheduledEventEntityType, GuildScheduledEventStatus } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildScheduledEvent } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildScheduledEventUpdate
})
export class GuildListener extends Listener {
	public async run(oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent): Promise<void> {
		const { events, validator } = this.container;

		if (isNullish(oldGuildScheduledEvent.channel) || isNullish(oldGuildScheduledEvent.guild)) return;

		if (
			oldGuildScheduledEvent.entityType !== GuildScheduledEventEntityType.External &&
			newGuildScheduledEvent.entityType === GuildScheduledEventEntityType.External
		) {
			const settings = await events.getSettings(newGuildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const active = await events.karaoke.isEventActive(oldGuildScheduledEvent.guildId, oldGuildScheduledEvent.channel.id);
			if (active) return;

			await events.karaoke.deleteEvent(oldGuildScheduledEvent.channel.id);
			return;
		}

		if (
			oldGuildScheduledEvent.status === GuildScheduledEventStatus.Scheduled &&
			newGuildScheduledEvent.status === GuildScheduledEventStatus.Active
		) {
			const result = await validator.client.hasPermissions(oldGuildScheduledEvent.guild, [
				PermissionFlagsBits.ManageEvents,
				PermissionFlagsBits.MuteMembers,
				PermissionFlagsBits.MoveMembers,
				PermissionFlagsBits.ManageChannels
			]);
			if (!result) return;

			const settings = await events.getSettings(newGuildScheduledEvent.guildId);
			if (isNullish(settings) || !settings.enabled) return;

			const exists = await events.karaoke.doesEventExist(oldGuildScheduledEvent.guildId, oldGuildScheduledEvent.channel.id);
			if (!exists) return;

			const active = await events.karaoke.isEventActive(oldGuildScheduledEvent.guildId, oldGuildScheduledEvent.channel.id);
			if (active) return;

			const event = await events.karaoke.fetchEvent(oldGuildScheduledEvent.channel.id);
			if (isNullish(event)) return;

			await events.karaoke.startScheduledEvent(oldGuildScheduledEvent.guild, event, oldGuildScheduledEvent.name);
		}
	}
}
