import type { KaraokeEvent, KaraokeEventUser } from '#prisma';
import type { GuildId } from '#types/database/index';
import type { Expand } from '#types/Generic';

export interface KaraokeEventId {
	eventId: KaraokeEvent['id'];
}

export type GuildAndKaraokeEventId = Expand<GuildId & KaraokeEventId>;

export type KaraokeEventWithUsers = Expand<KaraokeEvent & { queue: KaraokeEventUser[] }>;

export interface CreateEventData {
	id: KaraokeEvent['id'];
	textChannelId: KaraokeEvent['textChannelId'];
	pinMessageId?: KaraokeEvent['pinMessageId'];
	guildId: KaraokeEvent['guildId'];
}

export interface CreateScheduledEventData {
	id: KaraokeEvent['id'];
	textChannelId: KaraokeEvent['textChannelId'];
	discordEventId: KaraokeEvent['discordEventId'];
	roleId?: KaraokeEvent['roleId'];
	guildId: KaraokeEvent['guildId'];
}

export interface UpdateEventData {
	id: KaraokeEvent['id'];
	textChannelId?: KaraokeEvent['textChannelId'];
	locked?: KaraokeEvent['locked'];
	isActive?: KaraokeEvent['isActive'];
	pinMessageId?: KaraokeEvent['pinMessageId'];
	discordEventId?: KaraokeEvent['discordEventId'];
	roleId?: KaraokeEvent['roleId'];
}

export interface AddToQueueData {
	id: KaraokeEventUser['id'];
	name: KaraokeEventUser['name'];
	partnerId?: KaraokeEventUser['partnerId'];
	partnerName?: KaraokeEventUser['partnerName'];
}

export interface RemoveFromQueueData {
	id: KaraokeEventUser['id'];
	partnerId?: KaraokeEventUser['partnerId'];
}
