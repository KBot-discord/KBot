import { container } from '@sapphire/framework';
import { GetGuildSubscriptions, GetSubscription, Subscription } from '../rpc/gen/subscriptions/v1/subscriptions.pb';
import { GetAutocompleteChannel } from '../rpc/gen/channels/autocomplete/v1/autocomplete.pb';

export class YoutubeService {
	private readonly baseUrl;

	public constructor() {
		const { url, port } = container.config.rpc.youtube;
		this.baseUrl = `${url}:${port}`;
	}

	public async getAutocompleteChannel(input: string) {
		return GetAutocompleteChannel({ channelName: input }) //
			.then((res) => res.channels);
	}

	public async getSubscription(guildId: string, channelId: string): Promise<Subscription | null> {
		return GetSubscription({ guildId, channelId }, { baseURL: this.baseUrl }) //
			.then((res) => res.subscription);
	}

	public async getGuildSubscriptions(guildId: string): Promise<Subscription[] | null> {
		return GetGuildSubscriptions({ guildId }, { baseURL: this.baseUrl }) //
			.then((res) => res.subscriptions);
	}
}
