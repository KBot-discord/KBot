import type { HolodexChannel, PrismaClient } from '@kbotdev/prisma';
import type { HolodexChannelId, ServiceOptions } from '../lib/types';

export class YoutubeChannelRepository {
	private readonly database: PrismaClient;

	public constructor({ database }: Omit<ServiceOptions, 'cache'>) {
		this.database = database;
	}

	public async get({ channelId }: HolodexChannelId): Promise<HolodexChannel | null> {
		return this.database.holodexChannel.findUnique({
			where: { youtubeId: channelId }
		});
	}

	public async count(): Promise<number> {
		return this.database.holodexChannel.count();
	}
}
