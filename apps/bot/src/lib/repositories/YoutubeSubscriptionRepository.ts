import type { HolodexChannel, PrismaClient, YoutubeSubscription } from '@prisma/client';
import type { ServiceOptions } from './types/serviceTypes';
import type { GuildAndHolodexChannelId, UpdateYoutubeSubscriptionData, YoutubeSubscriptionWithChannel } from './types/youtube';
import type { GuildId, HolodexChannelId } from './types';

/**
 * Repository that handles database operations for YouTube subscriptions.
 */
export class YoutubeSubscriptionRepository {
	private readonly database: PrismaClient;

	public constructor({ database }: Omit<ServiceOptions, 'cache'>) {
		this.database = database;
	}

	/**
	 * Get a YouTube subscription.
	 * @param query - The {@link GuildAndHolodexChannelId} to query
	 */
	public async get(query: GuildAndHolodexChannelId): Promise<YoutubeSubscriptionWithChannel | null> {
		const { guildId, channelId } = query;

		return this.database.youtubeSubscription.findUnique({
			where: { channelId_guildId: { channelId, guildId } },
			include: { channel: true }
		});
	}

	/**
	 * Get the YouTube subscriptions of a guild.
	 * @param query - The {@link GuildId} to query
	 */
	public async getByGuild(query: GuildId): Promise<YoutubeSubscriptionWithChannel[]> {
		const { guildId } = query;

		return this.database.youtubeSubscription.findMany({
			where: { guildId },
			include: { channel: true }
		});
	}

	/**
	 * Get the YouTube subscriptions of a channel.
	 * @param query - The {@link HolodexChannelId} to query
	 */
	public async getByChannel(query: HolodexChannelId): Promise<YoutubeSubscription[]> {
		const { channelId } = query;

		return this.database.youtubeSubscription.findMany({
			where: { id: channelId }
		});
	}

	/**
	 * Get the YouTube subscriptions of a channel with valid settings to send notifications.
	 * @param query - The {@link HolodexChannelId} to query
	 */
	public async getValid(query: HolodexChannelId): Promise<YoutubeSubscription[]> {
		const { channelId } = query;

		return this.database.youtubeSubscription.findMany({
			where: {
				AND: {
					channelId,
					NOT: { discordChannelId: null },
					youtubeSettings: { enabled: true }
				}
			}
		});
	}

	/**
	 * Get the YouTube subscriptions of a channel with valid settings.
	 * @param query - The {@link GuildAndHolodexChannelId} to query
	 */
	public async delete(query: GuildAndHolodexChannelId): Promise<YoutubeSubscriptionWithChannel | null> {
		const { guildId, channelId } = query;

		return this.database.youtubeSubscription
			.delete({
				where: { channelId_guildId: { guildId, channelId } },
				include: { channel: true }
			})
			.catch(() => null);
	}

	/**
	 * Upsert a YouTube subscription.
	 * @param query - The {@link GuildAndHolodexChannelId} to query
	 * @param data - The {@link UpdateYoutubeSubscriptionData} to upsert the subscription
	 */
	public async upsert(
		query: GuildAndHolodexChannelId,
		data?: UpdateYoutubeSubscriptionData
	): Promise<YoutubeSubscription & { channel: HolodexChannel }> {
		const { guildId, channelId } = query;

		return this.database.youtubeSubscription.upsert({
			where: { channelId_guildId: { guildId, channelId } },
			update: { ...data },
			create: {
				channel: { connect: { youtubeId: channelId } },
				youtubeSettings: {
					connectOrCreate: {
						where: { guildId },
						create: {
							enabled: true,
							coreSettings: {
								connectOrCreate: {
									where: { guildId },
									create: { guildId }
								}
							}
						}
					}
				}
			},
			include: { channel: true }
		});
	}

	/**
	 * Get the YouTube subscription count of a guild.
	 * @param query - The {@link GuildId} to query
	 */
	public async countByGuild(query: GuildId): Promise<number> {
		const { guildId } = query;

		return this.database.youtubeSubscription.count({
			where: { guildId }
		});
	}

	/**
	 * Check if a YouTube subscriptions exists for a guild.
	 * @param query - The {@link GuildAndHolodexChannelId} to query
	 */
	public async exists(query: GuildAndHolodexChannelId): Promise<boolean> {
		const { guildId, channelId } = query;

		const result = await this.database.youtubeSubscription.count({
			where: { channelId, guildId }
		});
		return result > 0;
	}
}
