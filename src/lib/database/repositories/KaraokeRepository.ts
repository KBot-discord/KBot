import { container, Result } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { buildKey } from '../../util/keys';
import { RedisQueries, ServiceType } from '../../types/enums';
import type { Event, EventUser } from '@prisma/client';

export class KaraokeRepository {
	/**
	 * Create a new event entry in the database
	 * @param guildId The ID of the guild
	 * @param eventId The ID of the voice or stage channel
	 * @param channelId The ID of the command channel
	 * @param messageId The ID of the pinned instructions message
	 * @returns If the operation succeeded
	 */
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
			await this.setEventExistence(eventId, true);
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

	/**
	 * Get an event from the database
	 * @param eventId The ID of the voice or stage channel
	 * @returns The requested karaoke event
	 */
	public async fetchEvent(eventId: string): Promise<Event | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.findUnique({
				where: { id: eventId }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Get an event from the database, with the queue included
	 * @param eventId The ID of the voice or stage channel
	 * @returns The requested karaoke event and queue
	 */
	public async fetchEventWithQueue(eventId: string): Promise<(Event & { queue: EventUser[] }) | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.findUnique({
				where: { id: eventId },
				include: { queue: true }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Get all events for a guild from the database
	 * @param guildId The ID of the guild
	 * @returns All of the guild's karaoke events
	 */
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

	/**
	 * Delete an event from the database
	 * @param eventId The ID of the voice or stage channel
	 * @returns If the operation succeeded
	 */
	public async deleteEvent(eventId: string): Promise<Event | null> {
		const result = await Result.fromAsync(async () => {
			const event = await container.db.event.delete({
				where: { id: eventId }
			});
			await this.setEventExistence(eventId, false);
			return event;
		});
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Update whether the queue is locked or not
	 * @param eventId The ID of the voice or stage channel
	 * @param isLocked If the queue should be locked
	 * @returns If the operation succeeded
	 */
	public async updateQueueLock(eventId: string, isLocked: boolean): Promise<Event | null> {
		const result = await Result.fromAsync(async () =>
			container.db.event.update({
				where: { id: eventId },
				data: { locked: isLocked }
			})
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Add a member to the karaoke queue
	 * @param eventId The ID of the voice or stage channel
	 * @param memberId The ID of the member
	 * @param memberName The name of the member
	 * @param partnerId The ID of the partner
	 * @param partnerName The name of the partner
	 * @returns If the operation succeeded
	 */
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

	/**
	 * Get the karaoke queue of the specified event
	 * @param eventId The ID of the voice or stage channel
	 * @returns The karaoke queue
	 */
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

	/**
	 * Remove a member from the karaoke queue
	 * @param eventId The ID of the voice or stage channel
	 * @param memberId The ID of the member
	 * @param partnerId The ID of the partner
	 * @returns If the operation succeeded
	 */
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

	/**
	 * Check if an event already exists
	 * @param eventId The ID of the voice or stage channel
	 * @returns If the event exists
	 */
	public async doesEventExist(eventId: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () =>
			container.redis.fetch(buildKey(ServiceType.Karaoke, { id: eventId, query: RedisQueries.Exists }))
		);
		return result.match({ ok: (data) => data === 'true', err: () => null });
	}

	/**
	 * Set if an event exists
	 * @param eventId The ID of the voice or stage channel
	 * @param eventExists To be or not to be
	 * @returns If the event exists
	 */
	public async setEventExistence(eventId: string, eventExists: boolean): Promise<boolean | null> {
		const result = await Result.fromAsync(async () =>
			container.redis.add(buildKey(ServiceType.Karaoke, { id: eventId, query: RedisQueries.Exists }), `${eventExists}`)
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Set if an event is active in Redis
	 * @param eventId The ID of the voice or stage channel
	 * @param status If the event if active
	 * @returns If the operation succeeded
	 */
	public async setEventStatus(eventId: string, status: boolean): Promise<boolean | null> {
		const result = await Result.fromAsync(async () =>
			container.redis.add(buildKey(ServiceType.Karaoke, { id: eventId, query: RedisQueries.IsActive }), `${status}`)
		);
		return result.match({ ok: (data) => data, err: () => null });
	}

	/**
	 * Check if an event is active
	 * @param eventId The ID of the voice or stage channel
	 */
	public async isEventActive(eventId: string): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const doesEventExist = await this.doesEventExist(eventId);
			if (!doesEventExist) return false;
			return (await container.redis.fetch(buildKey(ServiceType.Karaoke, { id: eventId, query: RedisQueries.IsActive }))) === 'true';
		});
		return result.match({ ok: (data) => data, err: () => null });
	}
}
