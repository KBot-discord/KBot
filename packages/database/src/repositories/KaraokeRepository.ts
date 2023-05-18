import { karaokeEventExistsCacheKey, karaokeEventActiveCacheKey } from '../keys';
import { CacheValues } from '../lib/utilities';
import type { KaraokeEvent, KaraokeUser, PrismaClient } from '@kbotdev/prisma';
import type { RedisClient } from '@kbotdev/redis';
import type {
	AddToQueueData,
	CreateEventData,
	CreateScheduledEventData,
	GuildAndKaraokeEventId,
	GuildId,
	KaraokeEventId,
	RemoveFromQueueData,
	ServiceOptions,
	UpdateEventData
} from '../lib/types';

export class KaraokeRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly existsKey = karaokeEventExistsCacheKey;
	private readonly isActiveKey = karaokeEventActiveCacheKey;

	public constructor({ database, cache }: ServiceOptions) {
		this.database = database;

		this.cache = cache.client;
	}

	public async getEvent({ eventId }: KaraokeEventId): Promise<KaraokeEvent | null> {
		return this.database.karaokeEvent.findUnique({
			where: { id: eventId }
		});
	}

	public async getEventWithQueue({ eventId }: KaraokeEventId): Promise<
		| (KaraokeEvent & {
				queue: KaraokeUser[];
		  })
		| null
	> {
		return this.database.karaokeEvent.findUnique({
			where: { id: eventId },
			include: { queue: { orderBy: { createdAt: 'asc' } } }
		});
	}

	public async getEventByGuild({ guildId }: GuildId): Promise<KaraokeEvent[]> {
		return this.database.karaokeEvent.findMany({
			where: { guildId }
		});
	}

	public async deleteEvent({ eventId }: KaraokeEventId): Promise<KaraokeEvent | null> {
		return this.database.karaokeEvent
			.delete({
				where: { id: eventId }
			})
			.catch(() => null);
	}

	public async deleteScheduledEvent({ guildId, eventId }: GuildAndKaraokeEventId): Promise<KaraokeEvent | null> {
		await this.setEventExists({ eventId, guildId }, false);
		return this.deleteEvent({ eventId });
	}

	public async updateQueueLock({ eventId }: KaraokeEventId, isLocked: boolean): Promise<KaraokeEvent> {
		return this.database.karaokeEvent.update({
			where: { id: eventId },
			data: { locked: isLocked }
		});
	}

	public async createEvent({ id, guildId, textChannelId, pinMessageId }: CreateEventData): Promise<KaraokeEvent> {
		await this.setEventExists({ eventId: id, guildId }, true);
		return this.database.karaokeEvent.create({
			data: {
				id,
				textChannelId,
				locked: false,
				isActive: true,
				pinMessageId,
				eventSettings: { connect: { guildId } }
			}
		});
	}

	public async createScheduledEvent({ id, guildId, textChannelId, discordEventId, roleId }: CreateScheduledEventData): Promise<KaraokeEvent> {
		await this.setEventExists({ eventId: id, guildId }, true);
		return this.database.karaokeEvent.create({
			data: {
				id,
				textChannelId,
				locked: false,
				isActive: false,
				discordEventId,
				roleId,
				eventSettings: { connect: { guildId } }
			}
		});
	}

	public async updateEvent({ id, textChannelId, locked, isActive, discordEventId, roleId }: UpdateEventData): Promise<KaraokeEvent> {
		return this.database.karaokeEvent.update({
			where: { id },
			data: { textChannelId, locked, isActive, discordEventId, roleId }
		});
	}

	public async countEvents({ guildId }: GuildId): Promise<number> {
		return this.database.karaokeEvent.count({
			where: { guildId }
		});
	}

	public async eventExists({ guildId, eventId }: GuildAndKaraokeEventId): Promise<boolean> {
		const key = this.existsKey(guildId, eventId);

		const result = await this.cache.get(key);

		return result === CacheValues.Exists;
	}

	public async eventActive({ guildId, eventId }: GuildAndKaraokeEventId): Promise<boolean> {
		const key = this.isActiveKey(guildId, eventId);

		const result = await this.cache.get(key);

		return result === CacheValues.Active;
	}

	public async addUserToQueue(
		{ eventId }: KaraokeEventId,
		{ id, name, partnerId, partnerName }: AddToQueueData
	): Promise<
		KaraokeEvent & {
			queue: KaraokeUser[];
		}
	> {
		const data = await this.database.karaokeUser.create({
			data: { id, name, partnerId, partnerName, karaokeEvent: { connect: { id: eventId } } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return data.karaokeEvent;
	}

	public async removeUserFromQueue(
		{ eventId }: KaraokeEventId,
		{ id }: RemoveFromQueueData
	): Promise<
		KaraokeEvent & {
			queue: KaraokeUser[];
		}
	> {
		const data = await this.database.karaokeUser.delete({
			where: { id_eventId: { id, eventId } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return data.karaokeEvent;
	}

	public async setEventExists({ guildId, eventId }: GuildAndKaraokeEventId, exists: boolean): Promise<void> {
		const key = this.existsKey(guildId, eventId);

		const value = exists ? CacheValues.Exists : CacheValues.DoesNotExist;

		await this.cache.set(key, value);
	}

	public async setEventActive({ guildId, eventId }: GuildAndKaraokeEventId, active: boolean): Promise<void> {
		const key = this.isActiveKey(guildId, eventId);

		const value = active ? CacheValues.Active : CacheValues.Inactive;

		await this.cache.set(key, value);
	}
}
