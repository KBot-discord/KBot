import { VideoStatus } from '#prisma';
import { YoutubeModule } from '#modules/YoutubeModule';
import { isNullish } from '@sapphire/utilities';
import { youtube_v3 } from '@googleapis/youtube';
import { container } from '@sapphire/framework';
import type { YoutubeChannel } from '#prisma';
import type { YoutubeApiVideo } from '#types/Youtube';

export class YoutubeApiService {
	private readonly api: youtube_v3.Youtube;

	public constructor() {
		this.api = new youtube_v3.Youtube({
			auth: container.config.youtube.apiKey
		});
	}

	public async fetchChannels(channelId: string): Promise<YoutubeChannel[] | null> {
		const isValid = YoutubeModule.isYoutubeChannelIdValid(channelId);
		if (isValid) return null;

		const result = await this.api.channels.list({ forUsername: channelId, part: ['snippet'] });
		if (!result.data.items || result.data.items.length === 0) return null;

		return result.data.items //
			.filter(({ id, snippet }) => id && snippet?.title && snippet?.thumbnails?.default?.url)
			.map(({ id, snippet }) => ({
				id: id!,
				name: snippet!.title!,
				image: snippet!.thumbnails!.default!.url!
			}));
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
