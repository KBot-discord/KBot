import type { Event, EventUser } from '#prisma';
import type { QueryByGuildId } from './';
import type { Expand } from '#types/Generic';

export interface EventById {
	eventId: Event['id'];
}

export type EventByIdAndGuildId = Expand<EventById & QueryByGuildId>;

export type EventWithUsers = Expand<Event & { queue: EventUser[] }>;

export interface CreateEventData {
	id: Event['id'];
	textChannelId: Event['textChannelId'];
	pinMessageId?: Event['pinMessageId'];
	guildId: Event['guildId'];
}

export interface CreateScheduledEventData {
	id: Event['id'];
	textChannelId: Event['textChannelId'];
	discordEventId: Event['discordEventId'];
	roleId?: Event['roleId'];
	guildId: Event['guildId'];
}

export interface UpdateEventData {
	id: Event['id'];
	textChannelId: Event['textChannelId'];
	locked: Event['locked'];
	isActive: Event['isActive'];
	pinMessageId: Event['pinMessageId'];
	discordEventId?: Event['discordEventId'];
	roleId?: Event['roleId'];
}

export interface AddToQueueData {
	id: EventUser['id'];
	name: EventUser['name'];
	partnerId?: EventUser['partnerId'];
	partnerName?: EventUser['partnerName'];
}

export interface RemoveFromQueueData {
	id: EventUser['id'];
	partnerId?: EventUser['partnerId'];
}
