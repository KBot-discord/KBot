// Imports
import { container, Result } from '@sapphire/framework';
import { type GuildMember, type GuildMemberManager, MessageEmbed } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { Event, EventUser } from '@prisma/client';
import { embedColors } from '../lib/util/constants';
import { buildKey } from '../lib/util/keys';
import { RedisQueries, ServiceType } from '../lib/types/enums';

export class KaraokeService {
	public constructor() {
		container.logger.info('Karaoke service loaded.');
	}

	/**
	 * Event management methods
	 */

	/**
	 * Set the member/partner to the voice channel's speaker
	 * @param memberManager The GuildMemberManager of the client
	 * @param eventUser The EventUser entry of the member
	 * @returns If the operation succeeded
	 */
	public async setUserToAudience(memberManager: GuildMemberManager, eventUser: EventUser): Promise<boolean | null> {
		const result = await Result.fromAsync(async () => {
			const member = await memberManager.fetch(eventUser.id);
			if (member.voice.channelId) await member.voice.setSuppressed(true).catch();
			if (eventUser.partnerId) {
				const partner = await memberManager.fetch(eventUser.partnerId);
				if (partner.voice.channelId) await member.voice.setSuppressed(true).catch();
			}
		});
		return result.match({ ok: () => true, err: () => null });
	}

	/**
	 * Check if the member is allowed to join the karaoke queue
	 * @param event The ID of the event
	 * @param queue An array of objects containing the user ID and name
	 * @param memberId The ID of the member
	 * @param partner The GuildMember object of the partner, if applicable
	 * @returns If the member/partner is allowed to join and, if applicable, the reason for denial
	 */
	public isJoinValid(event: Event, queue: EventUser[], memberId: string, partner?: GuildMember): { isValid: boolean; reason?: string } {
		if (event.locked) {
			return { isValid: false, reason: 'The karaoke queue is locked.' };
		}
		if (queue.length > 50) {
			return { isValid: false, reason: 'Queue limit of 50 people has been reached.' };
		}
		if (memberId === partner?.id) {
			return { isValid: false, reason: 'You cannot duet with yourself.' };
		}
		if (partner && (!partner.voice.channelId || partner.voice.channelId !== event.id)) {
			return {
				isValid: false,
				reason: `Tell your partner to please join the stage, then run this command again.\n\n**Stage:** <#${event.id}>`
			};
		}
		if (queue.some((member) => member.id === memberId)) {
			return { isValid: false, reason: 'You are already in queue.' };
		}
		if (partner && queue.some((member) => member.id === partner.id)) {
			return { isValid: false, reason: 'You or your partner are already in the queue.' };
		}
		return { isValid: true };
	}

	/**
	 * Build a message embed based on the provided queue
	 * @param queue An array of objects containing the user ID and name
	 * @returns A formatted message embed
	 */
	public buildQueueEmbed(queue: EventUser[]): MessageEmbed {
		const embed = new MessageEmbed().setColor(embedColors.default).setAuthor({ name: 'Karaoke queue' }).setTitle('Queue is empty');
		if (queue.length === 0) return embed.setTitle('Queue is empty');

		const description = queue.map((entry, index) => `**${index}.** ${entry.name}`);
		return embed.setTitle(`Current singer: ${queue[0].name}`).setDescription(description.join('\n'));
	}

	/**
	 * Database methods
	 */

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
					utility: {
						connectOrCreate: {
							where: { id: guildId },
							create: { id: guildId, moduleEnabled: true }
						}
					}
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
		const result = await Result.fromAsync(async () => container.db.event.findUnique({ where: { id: eventId } }));
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
