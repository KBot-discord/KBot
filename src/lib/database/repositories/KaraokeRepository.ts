import { container, Result } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { karaokeEventActiveCacheKey, karaokeEventExistsCacheKey } from '../../util/cacheKeys';
import type { Event, EventUser } from '@prisma/client';

export class KaraokeRepository {
	private readonly existsKey = karaokeEventExistsCacheKey;
	private readonly isActiveKey = karaokeEventActiveCacheKey;

	public async createEvent(guildId: string, eventId: string, channelId: string, messageId: string): Promise<Event | null> {
		const result = await Result.fromAsync(async () => {
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
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async createScheduledEvent(
		guildId: string,
		eventId: string,
		channelId: string,
		scheduleId: string,
		roleId: string
	): Promise<Event | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.create({
				data: {
					id: eventId,
					channel: channelId,
					locked: false,
					isActive: false,
					scheduleId,
					role: roleId,
					utility: { connect: { id: guildId } }
				}
			})
		);
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	public async fetchEvent(eventId: string): Promise<Event | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.findUnique({
				where: { id: eventId }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async fetchEventWithQueue(eventId: string): Promise<(Event & { queue: EventUser[] }) | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.findUnique({
				where: { id: eventId },
				include: { queue: true }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async fetchEvents(guildId: string): Promise<Event[] | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.findMany({
				where: { guildId }
			})
		);
		return result.match({
			ok: (data) => data,
			err: (err) => {
				container.logger.error(err);
				return null;
			}
		});
	}

	public async deleteEvent(eventId: string): Promise<Event | null> {
		const result = await Result.fromAsync(async () => {
			const event = await container.db.event.delete({
				where: { id: eventId }
			});
			await this.setEventExistence(event.guildId, eventId, false);
			return event;
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async updateQueueLock(eventId: string, isLocked: boolean): Promise<Event | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.update({
				where: { id: eventId },
				data: { locked: isLocked }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async addToQueue(
		eventId: string,
		memberId: string,
		memberName: string,
		partnerId?: string,
		partnerName?: string
	): Promise<EventUser[] | null> {
		const result = await Result.fromAsync(async () => {
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
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async fetchQueue(eventId: string): Promise<EventUser[] | null> {
		const result = await Result.fromAsync(async () => {
			const data = await container.db.event.findUnique({
				where: { id: eventId },
				select: { queue: true }
			});
			if (isNullish(data)) return data;
			return data.queue;
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async removeFromQueue(eventId: string, memberId: string, partnerId?: string): Promise<EventUser[] | null> {
		const result = await Result.fromAsync(async () => {
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
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async fetchEventUser(eventId: string, userId: string): Promise<EventUser | null> {
		const result = await Result.fromAsync(async () => {
			return container.db.eventUser.findUnique({
				where: { id: userId, eventId }
			});
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	public async doesEventExist(guildId: string, eventId: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const key = this.existsKey(guildId, eventId);
			return container.redis.get(key);
		});
		return result.match({ ok: (data) => data === 'true', err: () => null });
	}

	public async setEventExistence(guildId: string, eventId: string, eventExists: boolean): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const key = this.existsKey(guildId, eventId);
			return container.redis.set(key, `${eventExists}`);
		});
		return result.match({ ok: (data) => data === 'OK', err: () => null });
	}

	public async setEventStatus(guildId: string, eventId: string, status: boolean): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const key = this.isActiveKey(guildId, eventId);
			return container.redis.set(key, `${status}`);
		});
		return result.match({ ok: (data) => data === 'OK', err: () => null });
	}

	public async isEventActive(guildId: string, eventId: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const doesEventExist = await this.doesEventExist(guildId, eventId);
			if (!doesEventExist) return false;
			const key = this.isActiveKey(guildId, eventId);
			return container.redis.get(key);
		});
		return result.match({ ok: (data) => data === 'true', err: () => null });
	}
}
