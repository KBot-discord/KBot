import { BASE_URL, ContentType } from '../utils/constants';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { HolodexOptions } from '../structures/Holodex';
import type { HolodexChannel } from '../types/channels';

export class ChannelHandler {
	private readonly apiKey: string;

	public constructor(options: HolodexOptions) {
		this.apiKey = options.apiKey;
	}

	public async get({ channelId }: { channelId: string }): Promise<HolodexChannel> {
		const url = new URL(`${BASE_URL}/channels/${channelId}`);

		return fetch<HolodexChannel>(
			url.href,
			{
				method: FetchMethods.Get,
				headers: {
					'Content-Type': ContentType.ApplicationJson,
					'X-APIKEY': this.apiKey
				}
			},
			FetchResultTypes.JSON
		);
	}

	public async getList({
		limit = 100,
		offset = 0
	}: {
		limit?: number;
		offset?: number;
	}): Promise<HolodexChannel[]> {
		const url = new URL(`${BASE_URL}/channels`);
		url.searchParams.append('type', 'vtuber');
		url.searchParams.append('limit', `${limit}`);
		url.searchParams.append('offset', `${offset}`);

		return fetch<HolodexChannel[]>(
			url.href,
			{
				method: FetchMethods.Get,
				headers: {
					'Content-Type': ContentType.ApplicationJson,
					'X-APIKEY': this.apiKey
				}
			},
			FetchResultTypes.JSON
		);
	}
}
