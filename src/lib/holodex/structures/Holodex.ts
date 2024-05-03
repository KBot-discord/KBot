import { ChannelHandler } from '../handlers/channels.js';
import { VideoHandler } from '../handlers/videos.js';

/**
 * Wrapper class to access the Holodex API.
 */
export class Holodex {
	/**
	 * Handler for any methods relating to channels.
	 */
	public readonly channels: ChannelHandler;

	/**
	 * Handler for any methods relating to videos.
	 */
	public readonly videos: VideoHandler;

	/**
	 * The options to pass to the {@link Holodex} client.
	 * @param options - The {@link HolodexOptions} to pass
	 */
	public constructor(options: HolodexOptions) {
		this.channels = new ChannelHandler(options);
		this.videos = new VideoHandler(options);
	}
}

export type HolodexOptions = {
	/**
	 * Your Holodex API key.
	 */
	apiKey: string;
};
