import { credentials, Metadata } from '@grpc/grpc-js';
import { promisify } from 'util';
import {
	ChannelServiceClient,
	AutocompleteChannelServiceClient,
	GetChannelRequest,
	GetChannelResponse,
	GetAutocompleteChannelRequest,
	GetAutocompleteChannelResponse
} from './';

export class ChannelsClient {
	private readonly channelClient: ChannelServiceClient;
	private readonly autocompleteClient: AutocompleteChannelServiceClient;

	public constructor() {
		this.channelClient = new ChannelServiceClient('localhost:4000', credentials.createInsecure());
		this.autocompleteClient = new AutocompleteChannelServiceClient('localhost:4000', credentials.createInsecure());
	}

	public async getChannel(channelId: string): Promise<GetChannelResponse.AsObject> {
		const request = new GetChannelRequest() //
			.setChannelId(channelId);
		return promisify(this.channelClient.getChannel.bind(this.channelClient, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}

	public async getAutocompleteChannel(channelName: string): Promise<GetAutocompleteChannelResponse.AsObject> {
		const request = new GetAutocompleteChannelRequest() //
			.setChannelName(channelName);
		return promisify(this.autocompleteClient.getAutocompleteChannel.bind(this.autocompleteClient, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}
}
