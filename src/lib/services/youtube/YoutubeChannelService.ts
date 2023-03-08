import { container } from '@sapphire/framework';
import type { PrismaClient, YoutubeChannel } from '#prisma';
import type { YoutubeChannelId } from '#types/database';

export class YoutubeChannelService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ channelId }: YoutubeChannelId): Promise<YoutubeChannel | null> {
		// TODO: Check API
		return this.database.youtubeChannel.findUnique({
			where: { id: channelId }
		});
	}

	public async upsertMany(channels: YoutubeChannel[]): Promise<YoutubeChannel[]> {
		return this.database.$transaction(
			channels.map(({ id, name, image }) => {
				return this.database.youtubeChannel.upsert({
					where: { id },
					update: { id, name, image },
					create: { id, name, image }
				});
			})
		);
	}

	public async exists({ channelId }: YoutubeChannelId): Promise<boolean> {
		const count = await this.database.youtubeChannel.count({ where: { id: channelId } });
		return count > 0;
	}

	public async count() {
		return this.database.youtubeChannel.count();
	}
}
