import { karaokeEventActiveCacheKey, karaokeEventExistsCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { PrismaClient, Event, EventUser } from '#prisma';
import type {
	CreateEventData,
	CreateScheduledEventData,
	EventById,
	AddToQueueData,
	RemoveFromQueueData,
	EventByIdAndGuildId,
	EventWithUsers,
	QueryByGuildId,
	UpdateEventData
} from '#types/repositories';

const CacheValues = {
	Exists: 'EXISTS',
	DoesNotExist: 'DOES_NOT_EXIST',
	Active: 'ACTIVE',
	Inactive: 'INACTIVE'
} as const;

export class KaraokeRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly existsKey = karaokeEventExistsCacheKey;
	private readonly isActiveKey = karaokeEventActiveCacheKey;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ eventId }: EventById): Promise<Event | null> {
		return this.database.event.findUnique({
			where: { id: eventId }
		});
	}

	public async findOneWithQueue({ eventId }: EventById): Promise<EventWithUsers | null> {
		return this.database.event.findUnique({
			where: { id: eventId },
			include: { queue: { orderBy: { createdAt: 'asc' } } }
		});
	}

	public async findManyByGuildId({ guildId }: QueryByGuildId): Promise<Event[]> {
		return this.database.event.findMany({
			where: { guildId }
		});
	}

	public async createOne({ id, guildId, textChannelId, pinMessageId }: CreateEventData): Promise<Event> {
		return this.database.event.create({
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

	public async createOneScheduled({ id, guildId, textChannelId, discordEventId, roleId }: CreateScheduledEventData): Promise<Event> {
		return this.database.event.create({
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

	public async deleteOne({ eventId }: EventById): Promise<Event | null> {
		return this.database.event
			.delete({
				where: { id: eventId }
			})
			.catch(() => null);
	}

	public async updateOne({ id, textChannelId, locked, isActive, discordEventId, roleId }: UpdateEventData): Promise<Event> {
		return this.database.event.update({
			where: { id },
			data: { textChannelId, locked, isActive, discordEventId, roleId }
		});
	}

	public async count({ guildId }: QueryByGuildId): Promise<number> {
		return this.database.event.count({
			where: { guildId }
		});
	}

	public async updateQueueLock({ eventId }: EventById, isLocked: boolean): Promise<Event> {
		return this.database.event.update({
			where: { id: eventId },
			data: { locked: isLocked }
		});
	}

	public async fetchQueue({ eventId }: EventById): Promise<EventUser[]> {
		return this.database.eventUser.findMany({
			where: { eventId },
			orderBy: {
				createdAt: 'asc'
			}
		});
	}

	public async addUserToQueue({ eventId }: EventById, { id, name, partnerId, partnerName }: AddToQueueData): Promise<EventWithUsers> {
		const data = await this.database.eventUser.create({
			data: { id, name, partnerId, partnerName, event: { connect: { id: eventId } } },
			include: {
				event: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return data.event;
	}

	public async removeUserFromQueue({ eventId }: EventById, { id }: RemoveFromQueueData): Promise<EventWithUsers> {
		const data = await this.database.eventUser.delete({
			where: { id_eventId: { id, eventId } },
			include: {
				event: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return data.event;
	}

	public async findOneUser({ eventId }: EventById, userId: string): Promise<EventUser | null> {
		return this.database.eventUser.findUnique({
			where: { id_eventId: { id: userId, eventId } }
		});
	}

	public async doesEventExist({ eventId, guildId }: EventByIdAndGuildId): Promise<boolean> {
		const key = this.existsKey(guildId, eventId);

		const result = await this.cache.get(key);

		return result === CacheValues.Exists;
	}

	public async setEventExistence({ eventId, guildId }: EventByIdAndGuildId, eventExists: boolean): Promise<boolean> {
		const key = this.existsKey(guildId, eventId);

		const value = eventExists ? CacheValues.Exists : CacheValues.DoesNotExist;

		return (await this.cache.set(key, value)) === 'OK';
	}

	public async isEventActive({ eventId, guildId }: EventByIdAndGuildId): Promise<boolean> {
		const key = this.isActiveKey(guildId, eventId);

		const result = await this.cache.get(key);

		return result === CacheValues.Active;
	}

	public async setEventActive({ eventId, guildId }: EventByIdAndGuildId, active: boolean): Promise<boolean> {
		const key = this.isActiveKey(guildId, eventId);

		const value = active ? CacheValues.Active : CacheValues.Inactive;

		return (await this.cache.set(key, value)) === 'OK';
	}
}
