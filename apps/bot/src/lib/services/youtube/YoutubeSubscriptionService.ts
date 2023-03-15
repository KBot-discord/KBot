import { container } from '@sapphire/framework';
import type {
	YoutubeChannelId,
	GuildAndYoutubeChannelId,
	UpdateYoutubeSubscriptionData,
	YoutubeSubscriptionWithChannel,
	GuildId
} from '#types/database';
import type { PrismaClient, YoutubeSubscription } from '#prisma';

export class YoutubeSubscriptionService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ guildId, channelId }: GuildAndYoutubeChannelId): Promise<YoutubeSubscriptionWithChannel | null> {
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

	public async getByChannel({ channelId }: YoutubeChannelId): Promise<YoutubeSubscription[]> {
		return this.database.youtubeSubscription.findMany({
			where: { id: channelId }
		});
	}

	public async getValid({ channelId }: YoutubeChannelId): Promise<YoutubeSubscription[]> {
		return this.database.youtubeSubscription.findMany({
			where: { AND: { id: channelId, NOT: { discordChannelId: null } } }
		});
	}

	public async delete({ guildId, channelId }: GuildAndYoutubeChannelId): Promise<YoutubeSubscriptionWithChannel | null> {
		return this.database.youtubeSubscription
			.delete({
				where: { channelId_guildId: { guildId, channelId } },
				include: { channel: true }
			})
			.catch(() => null);
	}

	public async create({ guildId, channelId }: GuildAndYoutubeChannelId) {
		return this.database.youtubeSubscription.create({
			data: { guildId, channelId },
			include: { channel: true }
		});
	}

	public async update({ guildId, channelId }: GuildAndYoutubeChannelId, data: UpdateYoutubeSubscriptionData) {
		return this.database.youtubeSubscription.update({
			where: { channelId_guildId: { guildId, channelId } },
			data,
			include: { channel: true }
		});
	}
}
