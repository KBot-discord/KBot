import { BASE_URL, ContentType } from '../utils/constants';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { HolodexOptions } from '../structures/Holodex';
import type { HolodexVideoWithChannel } from '../types/videos';
import type { PaginatedResponse } from '../types/api';

export class VideoHandler {
	private readonly apiKey: string;

	public constructor(options: HolodexOptions) {
		this.apiKey = options.apiKey;
	}

	public async getLive({ channels }: { channels: string[] }): Promise<HolodexVideoWithChannel[]> {
		const url = new URL(`${BASE_URL}/users/live`);
		url.searchParams.append('channels', channels.toString());

		return fetch<HolodexVideoWithChannel[]>(
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

	public async getPastPaginated({
		from,
		to,
		offset
	}: {
		from: number;
		to: number;
		offset: number;
	}): Promise<PaginatedResponse<HolodexVideoWithChannel>> {
		const url = new URL(`${BASE_URL}/videos`);
		url.searchParams.append('paginated', 'true');
		url.searchParams.append('status', 'past');
		url.searchParams.append('type', 'stream');
		url.searchParams.append('limit', '100');
		url.searchParams.append('from', new Date(from).toISOString());
		url.searchParams.append('to', new Date(to).toISOString());
		url.searchParams.append('offset', `${offset}`);

		return fetch<PaginatedResponse<HolodexVideoWithChannel>>(
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
