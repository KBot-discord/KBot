import { container } from '@sapphire/framework';
import type { UpdateYoutubeSubscriptionData, YoutubeSubscriptionWithChannel, GuildId, GuildAndHolodexChannelId } from '#types/database';
import type { PrismaClient, YoutubeSubscription } from '@kbotdev/database';
import type { HolodexChannelId } from '#types/database/Holodex';

export class YoutubeSubscriptionService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ guildId, channelId }: GuildAndHolodexChannelId): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.database.youtubeSubscription.findUnique({
			where: { channelId_guildId: { channelId, guildId } },
			include: { channel: true }
		});
	}

	public async getByGuild({ guildId }: GuildId): Promise<YoutubeSubscriptionWithChannel[]> {
		return this.database.youtubeSubscription.findMany({
			where: { guildId },
			include: { channel: true }
		});
	}

	public async getByChannel({ channelId }: HolodexChannelId): Promise<YoutubeSubscription[]> {
		return this.database.youtubeSubscription.findMany({
			where: { id: channelId }
		});
	}

	public async getValid({ channelId }: HolodexChannelId): Promise<YoutubeSubscription[]> {
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

	public async delete({ guildId, channelId }: GuildAndHolodexChannelId): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.database.youtubeSubscription
			.delete({
				where: { channelId_guildId: { guildId, channelId } },
				include: { channel: true }
			})
			.catch(() => null);
	}

	public async upsert({ guildId, channelId }: GuildAndHolodexChannelId, data?: UpdateYoutubeSubscriptionData) {
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

	public async countByGuild({ guildId }: GuildId) {
		return this.database.youtubeSubscription.count({
			where: { guildId }
		});
	}

	public async exists({ channelId, guildId }: GuildAndHolodexChannelId) {
		const result = await this.database.youtubeSubscription.count({
			where: { channelId, guildId }
		});
		return result > 0;
	}
}
