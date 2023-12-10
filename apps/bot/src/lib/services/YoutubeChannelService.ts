import { container } from '@sapphire/framework';
import type { HolodexChannel, PrismaClient } from '@prisma/client';

export class YoutubeChannelService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	/**
	 * Get a YouTube channel.
	 * @param channelId - The ID of the channel
	 */
	public async get(channelId: string): Promise<HolodexChannel | null> {
		return await this.database.holodexChannel.findUnique({
			where: { youtubeId: channelId }
		});
	}

	/**
	 * Get a count of the total amount of YouTube channels.
	 */
	public async count(): Promise<number> {
		return await this.database.holodexChannel.count();
	}
}
