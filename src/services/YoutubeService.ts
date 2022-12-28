import {
	DeleteSubscription,
	GetGuildSubscriptions,
	GetSubscription,
	PostSubscription,
	type Subscription
} from '../rpc/gen/subscriptions/v1/subscriptions.pb';
import { GetAutocompleteChannel } from '../rpc/gen/channels/autocomplete/v1/autocomplete.pb';
import { GetChannel } from '../rpc/gen/channels/v1/channels.pb';
import { container } from '@sapphire/framework';
import type { Channel } from '../rpc/gen/channels/v1/channels.pb';

export class YoutubeService {
	private readonly baseUrl;

	public constructor() {
		const { url, port } = container.config.rpc.youtube;
		this.baseUrl = `${url}:${port}`;
	}

	public async getAutocompleteChannel(input: string): Promise<Channel[] | null> {
		return GetAutocompleteChannel({ channelName: input }, { baseURL: this.baseUrl }) //
			.then((res) => res.channels)
			.catch(() => null);
	}

	public async getChannel(channelId: string): Promise<Channel | null> {
		return GetChannel({ channelId }, { baseURL: this.baseUrl }) //
			.then((res) => res.channel)
			.catch(() => null);
	}

	public async getSubscription(guildId: string, channelId: string): Promise<Subscription | null> {
		return GetSubscription({ guildId, channelId }, { baseURL: this.baseUrl }) //
			.then((res) => res.subscription)
			.catch(() => null);
	}

	public async getGuildSubscriptions(guildId: string): Promise<Subscription[] | null> {
		return GetGuildSubscriptions({ guildId }, { baseURL: this.baseUrl }) //
			.then((res) => res.subscriptions)
			.catch(() => null);
	}

	public async postSubscription(
		guildId: string,
		channelId: string,
		message: string | null,
		role: string | null,
		discordChannel: string | null
	): Promise<Subscription | null> {
		return PostSubscription(
			{ guildId, channelId, message: message ?? '', role: role ?? '', discordChannel: discordChannel ?? '' },
			{ baseURL: this.baseUrl }
		)
			.then((res) => res.subscription)
			.catch(() => null);
	}

	public async deleteSubscription(guildId: string, channelId: string): Promise<boolean | null> {
		return DeleteSubscription({ guildId, channelId }, { baseURL: this.baseUrl }) //
			.then(() => true)
			.catch(() => null);
	}
}
