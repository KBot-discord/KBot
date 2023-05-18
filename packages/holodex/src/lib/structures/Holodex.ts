import { VideoHandler } from '../../handlers/videos';
import { ChannelHandler } from '../../handlers/channels';

export class Holodex {
	public readonly channels: ChannelHandler;
	public readonly videos: VideoHandler;

	public constructor(options: HolodexOptions) {
		this.channels = new ChannelHandler(options);
		this.videos = new VideoHandler(options);
	}
}

export type HolodexOptions = {
	apiKey: string;
};
