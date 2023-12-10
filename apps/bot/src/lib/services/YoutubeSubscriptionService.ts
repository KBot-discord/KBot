import { container } from '@sapphire/framework';
import type { HolodexChannel, PrismaClient, YoutubeSubscription } from '@prisma/client';
import type { UpdateYoutubeSubscriptionData, YoutubeSubscriptionWithChannel } from '#lib/services/types';

export class YoutubeSubscriptionService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	/**
	 * Get a YouTube subscription.
	 * @param guildId - The ID of the guild
	 * @param channelId - The ID of the channel
	 */
	public async get(guildId: string, channelId: string): Promise<YoutubeSubscriptionWithChannel | null> {
		return await this.database.youtubeSubscription.findUnique({
			where: { channelId_guildId: { channelId, guildId } },
			include: { channel: true }
		});
	}

	/**
	 * Get the YouTube subscriptions of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async getByGuild(guildId: string): Promise<YoutubeSubscriptionWithChannel[]> {
		return await this.database.youtubeSubscription.findMany({
			where: { guildId },
			include: { channel: true }
		});
	}

	/**
	 * Get the YouTube subscriptions of a channel.
	 * @param channelId - The ID of the channel
	 */
	public async getByChannel(channelId: string): Promise<YoutubeSubscription[]> {
		return await this.database.youtubeSubscription.findMany({
			where: { id: channelId }
		});
	}

	/**
	 * Get the YouTube subscriptions of a channel with valid settings to send notifications.
	 * @param channelId - the ID of the channel
	 */
	public async getValid(channelId: string): Promise<YoutubeSubscription[]> {
		return await this.database.youtubeSubscription.findMany({
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
	 * Delete a YouTube subscription.
	 * @param guildId - The ID of the guild
	 * @param channelId - The ID of the channel
	 */
	public async delete(guildId: string, channelId: string): Promise<YoutubeSubscriptionWithChannel | null> {
		return await this.database.youtubeSubscription
			.delete({
				where: { channelId_guildId: { guildId, channelId } },
				include: { channel: true }
			})
			.catch(() => null);
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
		return await this.database.youtubeSubscription.upsert({
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
	 * Get a count of YouTube subscriptions of a guild.
	 * @param guildId - The ID of the guild
	 */
	public async countByGuild(guildId: string): Promise<number> {
		return await this.database.youtubeSubscription.count({
			where: { guildId }
		});
	}

	/**
	 * Check if a YouTube subscription exists.
	 * @param guildId - The ID of the guild
	 * @param channelId - The ID of the channel
	 */
	public async exists(guildId: string, channelId: string): Promise<boolean> {
		const result = await this.database.youtubeSubscription.count({
			where: { channelId, guildId }
		});
		return result > 0;
	}
}
