import { container } from '@sapphire/framework';
import { ChannelsClient, StreamsClient, SubscriptionClient } from '../rpc';

export class YoutubeService {
	public readonly channels;
	public readonly streams;
	public readonly subscriptions;

	public constructor() {
		this.channels = new ChannelsClient();
		this.streams = new StreamsClient();
		this.subscriptions = new SubscriptionClient();
		container.logger.info('Youtube service loaded.');
	}
}
