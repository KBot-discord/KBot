import { YoutubeChannelRepository } from '#repositories/YoutubeChannelService';
import { container } from '@sapphire/framework';
import type { HolodexChannel } from '@prisma/client';

export class YoutubeChannelService {
	private readonly repository: YoutubeChannelRepository;

	public constructor() {
		this.repository = new YoutubeChannelRepository({
			database: container.prisma
		});
	}

	/**
	 * Get a YouTube channel.
	 * @param channelId - The ID of the channel
	 */
	public async get(channelId: string): Promise<HolodexChannel | null> {
		return this.repository.get({ channelId });
	}

	/**
	 * Get a count of the total amount of YouTube channels.
	 */
	public async count(): Promise<number> {
		return this.repository.count();
	}
}
