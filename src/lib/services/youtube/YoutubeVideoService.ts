import { VideoStatus } from '#prisma';
import { isNullish } from '@sapphire/utilities';
import { youtube_v3 } from '@googleapis/youtube';
import { container } from '@sapphire/framework';
import type { PrismaClient, YoutubeVideo } from '#prisma';
import type { YoutubeApiVideo } from '#types/Youtube';

export class YoutubeVideoService {
	private readonly api: youtube_v3.Youtube;
	private readonly database: PrismaClient;

	public constructor() {
		this.api = new youtube_v3.Youtube({
			auth: container.config.youtube.apiKey
		});
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

	public async fetchVideos(videoIds: string[]): Promise<YoutubeApiVideo[] | null> {
		const result = await this.api.videos.list({ id: videoIds, part: ['snippet', 'liveStreamingDetails'] });
		if (isNullish(result.data.items) || result.data.items.length === 0) return null;

		const filteredResult = result.data.items.filter(({ id, snippet }) => {
			return !isNullish(id) && !isNullish(snippet?.title) && !isNullish(snippet?.channelId) && !isNullish(snippet?.thumbnails?.high?.url);
		});

		return filteredResult.map(({ id, snippet, liveStreamingDetails }) => {
			let data: YoutubeApiVideo;

			if (liveStreamingDetails) {
				let status;

				if (liveStreamingDetails!.actualEndTime) {
					status = VideoStatus.PAST;
				} else if (liveStreamingDetails!.actualStartTime) {
					status = VideoStatus.LIVE;
				} else if (liveStreamingDetails!.scheduledStartTime) {
					if (new Date() > new Date(liveStreamingDetails!.scheduledStartTime)) {
						status = VideoStatus.LIVE;
					} else {
						status = VideoStatus.UPCOMING;
					}
				} else {
					status = VideoStatus.PAST;
				}

				data = {
					id: id!,
					title: snippet!.title!,
					thumbnail: snippet!.thumbnails!.high!.url!,
					scheduledStartTime: liveStreamingDetails!.scheduledStartTime //
						? new Date(liveStreamingDetails!.scheduledStartTime)
						: null,
					actualStartTime: null,
					actualEndTime: null,
					channelId: snippet!.channelId!,
					status
				};
			} else {
				data = {
					id: id!,
					title: snippet!.title!,
					thumbnail: snippet!.thumbnails!.high!.url!,
					scheduledStartTime: null,
					actualStartTime: null,
					actualEndTime: null,
					channelId: snippet!.channelId!,
					status: VideoStatus.NONE
				};
			}

			return data;
		});
	}
}
