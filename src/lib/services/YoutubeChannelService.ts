import type { HolodexChannel } from '@prisma/client';
import { container } from '@sapphire/framework';

export class YoutubeChannelService {
	/**
	 * Get a YouTube channel.
	 * @param channelId - The ID of the channel
	 */
	public async get(channelId: string): Promise<HolodexChannel | null> {
		return await container.prisma.holodexChannel.findUnique({
			where: { youtubeId: channelId },
		});
	}

	/**
	 * Get a count of the total amount of YouTube channels.
	 */
	public async count(): Promise<number> {
		return await container.prisma.holodexChannel.count();
	}
}
