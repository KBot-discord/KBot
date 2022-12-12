import { credentials, Metadata } from '@grpc/grpc-js';
import { promisify } from 'util';
import { StreamServiceClient, GetStreamRequest, GetStreamResponse, GetStreamsRequest, GetStreamsResponse } from './';

export class StreamsClient {
	private readonly client: StreamServiceClient;

	public constructor() {
		this.client = new StreamServiceClient('localhost:4000', credentials.createInsecure());
	}

	public async getStream(streamId: string): Promise<GetStreamResponse.AsObject> {
		const request = new GetStreamRequest() //
			.setStreamId(streamId);
		return promisify(this.client.getStream.bind(this.client, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}

	public async getStreams(channelId: string): Promise<GetStreamsResponse.AsObject> {
		const request = new GetStreamsRequest() //
			.setChannelId(channelId);
		return promisify(this.client.getStreams.bind(this.client, request, new Metadata(), {}))() //
			.then((res) => res.toObject());
	}
}
