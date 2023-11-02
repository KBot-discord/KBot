import type { HolodexChannel, PrismaClient } from '@prisma/client';
import type { ServiceOptions } from './types/serviceTypes';
import type { HolodexChannelId } from './types';

/**
 * Repository that handles database operations for YouTube channels.
 */
export class YoutubeChannelRepository {
	private readonly database: PrismaClient;

	public constructor({ database }: Omit<ServiceOptions, 'cache'>) {
		this.database = database;
	}

	/**
	 * Get a Holodex channel.
	 * @param query - The {@link HolodexChannelId} to query
	 */
	public async get(query: HolodexChannelId): Promise<HolodexChannel | null> {
		const { channelId } = query;

		return this.database.holodexChannel.findUnique({
			where: { youtubeId: channelId }
		});
	}

	/**
	 * Get a count of all Holodex channels.
	 */
	public async count(): Promise<number> {
		return this.database.holodexChannel.count();
	}
}
