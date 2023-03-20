import { ChannelHandler } from '../handlers/channels';
import { VideoHandler } from '../handlers/videos';

export class Holodex {
	public readonly channels: ChannelHandler;
	public readonly videos: VideoHandler;

	public constructor(options: HolodexOptions) {
		this.channels = new ChannelHandler(options);
		this.videos = new VideoHandler(options);
	}
}

export interface HolodexOptions {
	apiKey: string;
}
