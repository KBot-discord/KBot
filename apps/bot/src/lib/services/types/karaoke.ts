import type { KaraokeEvent, KaraokeUser } from '@prisma/client';
import type { GuildId } from './generic';

export type KaraokeEventId = {
	eventId: string;
};

export type GuildAndKaraokeEventId = GuildId & KaraokeEventId;

export type KaraokeEventWithUsers = KaraokeEvent & { queue: KaraokeUser[] };

export type CreateEventData = {
	id: string;
	textChannelId: string;
	pinMessageId?: string;
	guildId: string;
};

export type CreateScheduledEventData = {
	id: string;
	textChannelId: string;
	discordEventId: string | null;
	roleId?: string | null;
	guildId: string;
};

export type UpdateEventData = {
	id: string;
	textChannelId?: string;
	locked?: boolean;
	isActive?: boolean;
	pinMessageId?: string | null;
	discordEventId?: string | null;
	roleId?: string | null;
};

export type AddToQueueData = {
	id: string;
	name: string;
	partnerId?: string | null;
	partnerName?: string | null;
};

export type RemoveFromQueueData = {
	id: string;
	partnerId?: string | null;
};
