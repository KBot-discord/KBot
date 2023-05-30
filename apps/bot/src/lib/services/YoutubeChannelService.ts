import { container } from '@sapphire/framework';
import { YoutubeChannelRepository } from '@kbotdev/database';
import type { HolodexChannel } from '@kbotdev/database';

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
