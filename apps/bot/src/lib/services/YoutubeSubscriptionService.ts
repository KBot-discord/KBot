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

	/**
	 * Get a YouTube subscription.
	 * @param guildId - The ID of the guild
	 * @param channelId - The ID of the channel
	 */
	public async get(guildId: string, channelId: string): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.repository.get({ guildId, channelId });
	}

	/**
	 * Get the YouTube subscriptions of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async getByGuild(guildId: string): Promise<YoutubeSubscriptionWithChannel[]> {
		return this.repository.getByGuild({ guildId });
	}

	/**
	 * Get the YouTube subscriptions of a channel.
	 * @param channelId - The ID of the channel
	 */
	public async getByChannel(channelId: string): Promise<YoutubeSubscription[]> {
		return this.repository.getByChannel({ channelId });
	}

	/**
	 * Get the YouTube subscriptions of a channel with valid settings to send notifications.
	 * @param channelId - the ID of the channel
	 */
	public async getValid(channelId: string): Promise<YoutubeSubscription[]> {
		return this.repository.getValid({ channelId });
	}

	/**
	 * Delete a YouTube subscription.
	 * @param guildId - The ID of the guild
	 * @param channelId - The ID of the channel
	 */
	public async delete(guildId: string, channelId: string): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.repository.delete({ guildId, channelId });
	}

	/**
	 * Add or update a YouTube subscription.
	 * @param guildId -The ID of the guild
	 * @param channelId - The ID of the channel
	 * @param data - The data to upsert a subscription
	 */
	public async upsert(
		guildId: string,
		channelId: string,
		data?: UpdateYoutubeSubscriptionData
	): Promise<YoutubeSubscription & { channel: HolodexChannel }> {
		return this.repository.upsert({ guildId, channelId }, data);
	}

	/**
	 * Get a count of YouTube subscriptions of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async countByGuild(guildId: string): Promise<number> {
		return this.repository.countByGuild({ guildId });
	}

	/**
	 * Check if a YouTube subscription exists.
	 * @param guildId - The ID of the guild
	 * @param channelId - The ID of the channel
	 */
	public async exists(guildId: string, channelId: string): Promise<boolean> {
		return this.repository.exists({ guildId, channelId });
	}
}
