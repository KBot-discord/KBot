import { karaokeEventActiveCacheKey, karaokeEventExistsCacheKey } from '#utils/cacheKeys';
import { container } from '@sapphire/framework';
import type { Event, EventUser } from '@prisma/client';

export class KaraokeRepository {
	private readonly eventDb;
	private readonly userDb;
	private readonly cache;

	private readonly existsKey = karaokeEventExistsCacheKey;
	private readonly isActiveKey = karaokeEventActiveCacheKey;

	public constructor() {
		this.eventDb = container.db.event;
		this.userDb = container.db.eventUser;
		this.cache = container.redis;
	}

	public async createEvent(guildId: string, eventId: string, channelId: string, messageId: string): Promise<Event | null> {
		const event = await this.eventDb.create({
			data: {
				id: eventId,
				channel: channelId,
				locked: false,
				isActive: true,
				pinMsg: messageId,
				utility: { connect: { id: guildId } }
			}
		});
		await this.setEventExistence(event.guildId, eventId, true);
		return event;
	}

	public async createScheduledEvent(
		guildId: string,
		eventId: string,
		channelId: string,
		scheduleId: string,
		roleId: string
	): Promise<Event | null> {
		return this.eventDb.create({
			data: {
				id: eventId,
				channel: channelId,
				locked: false,
				isActive: false,
				scheduleId,
				role: roleId,
				utility: { connect: { id: guildId } }
			}
		});
	}

	public async fetchEvent(eventId: string): Promise<Event | null> {
		return this.eventDb.findUnique({
			where: { id: eventId }
		});
	}

	public async fetchEventWithQueue(eventId: string): Promise<{ event: Event | null; users: EventUser[] }> {
		const [event, users] = await container.db.$transaction([
			this.eventDb.findUnique({
				where: { id: eventId }
			}),
			this.userDb.findMany({
				where: { eventId },
				orderBy: {
					createdAt: 'asc'
				}
			})
		]);
		return { event, users };
	}

	public async fetchEvents(guildId: string): Promise<Event[] | null> {
		return this.eventDb.findMany({
			where: { guildId }
		});
	}

	public async deleteEvent(eventId: string): Promise<Event | null> {
		const event = await this.eventDb.delete({
			where: { id: eventId }
		});
		await this.setEventExistence(event.guildId, eventId, false);
		return event;
	}

	public async updateQueueLock(eventId: string, isLocked: boolean): Promise<Event | null> {
		return this.eventDb.update({
			where: { id: eventId },
			data: { locked: isLocked }
		});
	}

	public async addToQueue(eventId: string, memberId: string, memberName: string, partnerId?: string, partnerName?: string): Promise<EventUser[]> {
		const data = await this.eventDb.update({
			where: { id: eventId },
			data: {
				queue: {
					create: { id: memberId, name: memberName, partnerId, partnerName }
				}
			},
			include: { queue: true }
		});
		return data.queue;
	}

	public async fetchQueue(eventId: string): Promise<EventUser[] | null> {
		return this.userDb.findMany({
			where: { eventId },
			orderBy: {
				createdAt: 'asc'
			}
		});
	}

	public async removeFromQueue(eventId: string, memberId: string, partnerId?: string): Promise<EventUser[] | null> {
		const data = await this.userDb.delete({
			where: { id: memberId, partnerId, eventId },
			select: {
				event: {
					include: { queue: true }
				}
			}
		});
		return data.event.queue;
	}

	public async fetchEventUser(eventId: string, userId: string): Promise<EventUser | null> {
		return this.userDb.findUnique({
			where: { id: userId, eventId }
		});
	}

	public async doesEventExist(guildId: string, eventId: string): Promise<boolean | null> {
		const key = this.existsKey(guildId, eventId);
		return (await this.cache.get(key)) === 'true';
	}

	public async setEventExistence(guildId: string, eventId: string, eventExists: boolean): Promise<boolean | null> {
		const key = this.existsKey(guildId, eventId);
		return (await this.cache.set(key, eventExists)) === 'OK';
	}

	public async isEventActive(guildId: string, eventId: string): Promise<boolean | null> {
		const key = this.isActiveKey(guildId, eventId);
		return (await this.cache.get(key)) === 'true';
	}

	public async setEventActive(guildId: string, eventId: string, active: boolean): Promise<boolean | null> {
		const key = this.isActiveKey(guildId, eventId);
		return (await this.cache.set(key, active)) === 'OK';
	}
}
