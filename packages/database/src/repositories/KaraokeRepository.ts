import type { KaraokeEvent, KaraokeUser, PrismaClient } from '@kbotdev/prisma';
import type {
	AddToQueueData,
	CreateEventData,
	CreateScheduledEventData,
	GuildId,
	KaraokeEventId,
	RemoveFromQueueData,
	ServiceOptions,
	UpdateEventData
} from '../lib/types';

/**
 * Repository that handles database operations for karaoke events.
 */
export class KaraokeRepository {
	private readonly database: PrismaClient;

	public constructor({ database }: Omit<ServiceOptions, 'cache'>) {
		this.database = database;
	}

	/**
	 * Get a karaoke event.
	 * @param query - The {@link KaraokeEventId} to query
	 */
	public async getEvent(query: KaraokeEventId): Promise<KaraokeEvent | null> {
		const { eventId } = query;

		return this.database.karaokeEvent.findUnique({
			where: { id: eventId }
		});
	}

	/**
	 * Get a karaoke event along with its queue.
	 * @param query - The {@link KaraokeEventId} to query
	 */
	public async getEventWithQueue(query: KaraokeEventId): Promise<(KaraokeEvent & { queue: KaraokeUser[] }) | null> {
		const { eventId } = query;

		return this.database.karaokeEvent.findUnique({
			where: { id: eventId },
			include: { queue: { orderBy: { createdAt: 'asc' } } }
		});
	}

	/**
	 * Get all the karaoke events of a guild.
	 * @param query - The {@link GuildId} to query
	 */
	public async getEventByGuild(query: GuildId): Promise<KaraokeEvent[]> {
		const { guildId } = query;

		return this.database.karaokeEvent.findMany({
			where: { guildId }
		});
	}

	/**
	 * Delete a karaoke event.
	 * @param query - The {@link KaraokeEventId} to query
	 */
	public async deleteEvent(query: KaraokeEventId): Promise<KaraokeEvent | null> {
		const { eventId } = query;

		return this.database.karaokeEvent
			.delete({
				where: { id: eventId }
			})
			.catch(() => null);
	}

	/**
	 * Create a karaoke event.
	 * @param data - The {@link CreateEventData} to create the karaoke event
	 */
	public async createEvent(data: CreateEventData): Promise<KaraokeEvent> {
		const { id, guildId, textChannelId, pinMessageId } = data;

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

	/**
	 * Create a scheduled karaoke event.
	 * @param data - The {@link CreateScheduledEventData} to create the scheduled karaoke event
	 */
	public async createScheduledEvent(data: CreateScheduledEventData): Promise<KaraokeEvent> {
		const { id, guildId, textChannelId, discordEventId, roleId } = data;

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

	/**
	 * Update a karaoke event.
	 * @param data - The {@link UpdateEventData} to update the karaoke event
	 */
	public async updateEvent(data: UpdateEventData): Promise<KaraokeEvent> {
		const { id, textChannelId, locked, isActive, discordEventId, roleId } = data;

		return this.database.karaokeEvent.update({
			where: { id },
			data: { textChannelId, locked, isActive, discordEventId, roleId }
		});
	}

	/**
	 * Get the count of all the karaoke events.
	 */
	public async countEvents(): Promise<number> {
		return this.database.karaokeEvent.count();
	}

	/**
	 * Get the count of karaoke events in a guild.
	 * @param query - The {@link GuildId} to query
	 */
	public async countEventsByGuild(query: GuildId): Promise<number> {
		const { guildId } = query;

		return this.database.karaokeEvent.count({
			where: { guildId }
		});
	}

	/**
	 * Add a user to a karaoke event's queue.
	 * @param query - The {@link KaraokeEventId} to query
	 * @param data - The {@link AddToQueueData} to add the user to the queue
	 */
	public async addUserToQueue(query: KaraokeEventId, data: AddToQueueData): Promise<KaraokeEvent & { queue: KaraokeUser[] }> {
		const { eventId } = query;
		const { id, name, partnerId, partnerName } = data;

		const result = await this.database.karaokeUser.create({
			data: { id, name, partnerId, partnerName, karaokeEvent: { connect: { id: eventId } } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return result.karaokeEvent;
	}

	/**
	 * Remove a user from a karaoke event's queue.
	 * @param query - The {@link KaraokeEventId} to query
	 * @param data - The {@link RemoveFromQueueData} to remove the user to the queue
	 */
	public async removeUserFromQueue(query: KaraokeEventId, data: RemoveFromQueueData): Promise<KaraokeEvent & { queue: KaraokeUser[] }> {
		const { eventId } = query;
		const { id } = data;

		const result = await this.database.karaokeUser.delete({
			where: { id_eventId: { id, eventId } },
			include: {
				karaokeEvent: {
					include: { queue: { orderBy: { createdAt: 'asc' } } }
				}
			}
		});

		return result.karaokeEvent;
	}
}
