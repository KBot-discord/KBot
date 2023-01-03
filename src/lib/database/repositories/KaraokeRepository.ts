import { karaokeEventActiveCacheKey, karaokeEventExistsCacheKey } from '#utils/cacheKeys';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { Event, EventUser } from '@prisma/client';

export class KaraokeRepository {
	private readonly existsKey = karaokeEventExistsCacheKey;
	private readonly isActiveKey = karaokeEventActiveCacheKey;

	public async createEvent(guildId: string, eventId: string, channelId: string, messageId: string): Promise<Event | null> {
		const event = await container.db.event.create({
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
		return container.db.event.create({
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
		return container.db.event.findUnique({
			where: { id: eventId }
		});
	}

	public async fetchEventWithQueue(eventId: string): Promise<(Event & { queue: EventUser[] }) | null> {
		return container.db.event.findUnique({
			where: { id: eventId },
			include: { queue: true }
		});
	}

	public async fetchEvents(guildId: string): Promise<Event[] | null> {
		return container.db.event.findMany({
			where: { guildId }
		});
	}

	public async deleteEvent(eventId: string): Promise<Event | null> {
		const event = await container.db.event.delete({
			where: { id: eventId }
		});
		await this.setEventExistence(event.guildId, eventId, false);
		return event;
	}

	public async updateQueueLock(eventId: string, isLocked: boolean): Promise<Event | null> {
		return container.db.event.update({
			where: { id: eventId },
			data: { locked: isLocked }
		});
	}

	public async addToQueue(
		eventId: string,
		memberId: string,
		memberName: string,
		partnerId?: string,
		partnerName?: string
	): Promise<EventUser[] | null> {
		const data = await container.db.event.update({
			where: { id: eventId },
			data: {
				queue: {
					create: { id: memberId, name: memberName, partnerId, partnerName }
				}
			},
			include: { queue: true }
		});
		if (isNullish(data)) return data;
		return data.queue;
	}

	public async fetchQueue(eventId: string): Promise<EventUser[] | null> {
		const data = await container.db.event.findUnique({
			where: { id: eventId },
			select: { queue: true }
		});
		if (isNullish(data)) return data;
		return data.queue;
	}

	public async removeFromQueue(eventId: string, memberId: string, partnerId?: string): Promise<EventUser[] | null> {
		const data = await container.db.eventUser.delete({
			where: { id: memberId, partnerId, eventId },
			select: {
				event: {
					include: { queue: true }
				}
			}
		});
		if (isNullish(data)) return data;
		return data.event.queue;
	}

	public async fetchEventUser(eventId: string, userId: string): Promise<EventUser | null> {
		return container.db.eventUser.findUnique({
			where: { id: userId, eventId }
		});
	}

	public async doesEventExist(guildId: string, eventId: string): Promise<boolean | null> {
		const key = this.existsKey(guildId, eventId);
		return container.redis.get(key);
	}

	public async setEventExistence(guildId: string, eventId: string, eventExists: boolean): Promise<boolean | null> {
		const key = this.existsKey(guildId, eventId);
		return (await container.redis.set(key, `${eventExists}`)) === 'OK';
	}

	public async setEventStatus(guildId: string, eventId: string, status: boolean): Promise<boolean | null> {
		const key = this.isActiveKey(guildId, eventId);
		return (await container.redis.set(key, `${status}`)) === 'OK';
	}

	public async isEventActive(guildId: string, eventId: string): Promise<boolean | null> {
		const doesEventExist = await this.doesEventExist(guildId, eventId);
		if (!doesEventExist) return false;
		const key = this.isActiveKey(guildId, eventId);
		return container.redis.get(key);
	}
}
