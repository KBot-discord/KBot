import { credentials, Metadata } from '@grpc/grpc-js';
import { promisify } from 'util';
import {
	Subscription,
	SubscriptionServiceClient,
	GetSubscriptionRequest,
	GetSubscriptionResponse,
	PostSubscriptionRequest,
	PostSubscriptionResponse,
	GetGuildSubscriptionsRequest,
	GetGuildSubscriptionsResponse,
	GetChannelSubscriptionsRequest,
	GetChannelSubscriptionsResponse
} from './';

export class SubscriptionClient {
	private readonly client: SubscriptionServiceClient;

	public constructor() {
		this.client = new SubscriptionServiceClient('localhost:4000', credentials.createInsecure());
	}

	public async getSubscription(guildId: string, channelId: string): Promise<GetSubscriptionResponse.AsObject> {
		const request = new GetSubscriptionRequest() //
			.setGuildId(guildId)
			.setChannelId(channelId);
		return promisify(this.client.getSubscription.bind(this.client, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}

	public async postSubscription(
		message: string,
		role: string,
		discordChannel: string,
		webhookId: string,
		webhookToken: string,
		channelId: string,
		guildId: string
	): Promise<PostSubscriptionResponse.AsObject> {
		const subscription = new Subscription() //
			.setMessage(message)
			.setRole(role)
			.setDiscordChannel(discordChannel)
			.setWebhookId(webhookId)
			.setWebhookToken(webhookToken)
			.setChannelId(channelId)
			.setGuildId(guildId);
		const request = new PostSubscriptionRequest() //
			.setSubscription(subscription);
		return promisify(this.client.postSubscription.bind(this.client, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}

	public async getGuildSubscriptions(guildId: string): Promise<GetGuildSubscriptionsResponse.AsObject> {
		const request = new GetGuildSubscriptionsRequest() //
			.setGuildId(guildId);
		return promisify(this.client.getGuildSubscriptions.bind(this.client, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}

	public async getChannelSubscriptions(channelId: string): Promise<GetChannelSubscriptionsResponse.AsObject> {
		const request = new GetChannelSubscriptionsRequest() //
			.setChannelId(channelId);
		return promisify(this.client.getChannelSubscriptions.bind(this.client, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}
}
