import { VideoStatus } from '#prisma';
import { container } from '@sapphire/framework';
import type { PrismaClient, YoutubeVideo } from '#prisma';

export class YoutubeVideoService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get(videoId: string): Promise<YoutubeVideo | null> {
		return this.database.youtubeVideo.findUnique({
			where: { id: videoId }
		});
	}

	public async getByChannel(channelId: string): Promise<YoutubeVideo[]> {
		return this.database.youtubeVideo.findMany({
			where: { channelId }
		});
	}

	public async getUpcoming(): Promise<YoutubeVideo[]> {
		return this.database.youtubeVideo.findMany({
			where: { status: { in: [VideoStatus.LIVE, VideoStatus.UPCOMING] } },
			take: 50,
			orderBy: { status: 'asc' }
		});
	}

	public async upsertMany(videos: Omit<YoutubeVideo, 'updatedAt'>[]): Promise<YoutubeVideo[]> {
		return this.database.$transaction(
			videos.map((video) => {
				return this.database.youtubeVideo.upsert({
					where: { id: video.id },
					update: video,
					create: video
				});
			})
		);
	}

	public async handleNewVideo({
		id,
		title,
		thumbnail,
		status,
		scheduledStartTime,
		channelId
	}: Omit<YoutubeVideo, 'updatedAt'>): Promise<YoutubeVideo | null> {
		return this.database.youtubeVideo.upsert({
			where: { id },
			update: { id, title, thumbnail, status, scheduledStartTime, channel: { connect: { id: channelId } } },
			create: { id, title, thumbnail, status, scheduledStartTime, channel: { connect: { id: channelId } } }
		});
	}
}
