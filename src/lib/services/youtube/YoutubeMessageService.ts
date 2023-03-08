import { container } from '@sapphire/framework';
import type { PrismaClient } from '#prisma';
import type { YoutubeVideoById } from '#types/database';

export class YoutubeMessageService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async getByVideo({ videoId }: YoutubeVideoById) {
		return this.database.youtubeMessage.findMany({
			where: { videoId }
		});
	}
}
