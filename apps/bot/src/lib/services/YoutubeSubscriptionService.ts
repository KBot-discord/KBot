import { container } from '@sapphire/framework';
import { YoutubeSubscriptionRepository } from '@kbotdev/database';
import type { HolodexChannel, UpdateYoutubeSubscriptionData, YoutubeSubscription, YoutubeSubscriptionWithChannel } from '@kbotdev/database';

export class YoutubeSubscriptionService {
	private readonly repository: YoutubeSubscriptionRepository;

	public constructor() {
		this.repository = new YoutubeSubscriptionRepository({
			database: container.prisma
		});
	}

	public async get(guildId: string, channelId: string): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.repository.get({ guildId, channelId });
	}

	public async getByGuild(guildId: string): Promise<YoutubeSubscriptionWithChannel[]> {
		return this.repository.getByGuild({ guildId });
	}

	public async getByChannel(channelId: string): Promise<YoutubeSubscription[]> {
		return this.repository.getByChannel({ channelId });
	}

	public async getValid(channelId: string): Promise<YoutubeSubscription[]> {
		return this.repository.getValid({ channelId });
	}

	public async delete(guildId: string, channelId: string): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.repository.delete({ guildId, channelId });
	}

	public async upsert(
		guildId: string,
		channelId: string,
		data?: UpdateYoutubeSubscriptionData
	): Promise<YoutubeSubscription & { channel: HolodexChannel }> {
		return this.repository.upsert({ guildId, channelId }, data);
	}

	public async countByGuild(guildId: string): Promise<number> {
		return this.repository.countByGuild({ guildId });
	}

	public async exists(guildId: string, channelId: string): Promise<boolean> {
		return this.repository.exists({ guildId, channelId });
	}
}
