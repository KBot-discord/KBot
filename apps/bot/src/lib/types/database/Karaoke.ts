import type { KaraokeEvent, KaraokeUser } from '#prisma';
import type { GuildId } from '#types/database/index';
import type { Expand } from '#types/Generic';

export interface KaraokeEventId {
	eventId: KaraokeEvent['id'];
}

export type GuildAndKaraokeEventId = Expand<GuildId & KaraokeEventId>;

export type KaraokeEventWithUsers = Expand<KaraokeEvent & { queue: KaraokeUser[] }>;

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
	id: KaraokeUser['id'];
	name: KaraokeUser['name'];
	partnerId?: KaraokeUser['partnerId'];
	partnerName?: KaraokeUser['partnerName'];
}

export interface RemoveFromQueueData {
	id: KaraokeUser['id'];
	partnerId?: KaraokeUser['partnerId'];
}
