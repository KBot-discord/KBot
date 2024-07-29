import type { HolodexChannelMin } from './channels.js';

/**
 * A Holodex video.
 */
export type HolodexVideo = {
	/**
	 * Takes on the first non-null value of `end_actual`, `start_actual`, `start_scheduled`, or `published_at`.
	 */
	available_at: string;

	/**
	 * Duration of the video in seconds.
	 */
	duration: number;

	/**
	 * The ID of the video.
	 */
	id: string;

	/**
	 * When the video was published.
	 */
	published_at: string | null;

	/**
	 * When the stream actually started.
	 */
	start_actual: string | null;

	/**
	 * When the video is scheduled to start.
	 */
	start_scheduled: string | null;

	/**
	 * The status of the video.
	 */
	status: 'live' | 'missing' | 'new' | 'past' | 'upcoming';

	/**
	 * The title of the stream.
	 */
	title: string;

	/**
	 * Corresponds to a Topic ID, Videos of type clip cannot not have topic. Streams may or may not have topic.
	 */
	topic_id: string | null;

	/**
	 * If the video is a clip or stream.
	 */
	type: 'clip' | 'stream';

	/**
	 * The description of the video.
	 */
	description: string | null;
};

/**
 * A Holodex video with a channel.
 */
export type HolodexVideoWithChannel = HolodexVideo & {
	/**
	 * A Holodex channel.
	 */
	channel: HolodexChannelMin;
};
