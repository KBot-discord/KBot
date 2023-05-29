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

	public async get(channelId: string): Promise<HolodexChannel | null> {
		return this.repository.get({ channelId });
	}

	public async count(): Promise<number> {
		return this.repository.count();
	}
}
