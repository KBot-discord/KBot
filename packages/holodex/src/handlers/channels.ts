import { BASE_URL } from '../lib/utilities/constants';
import { fetchApi } from '../lib/utilities/fetch';
import type { HolodexOptions } from '../lib/structures/Holodex';
import type { HolodexChannel } from '../lib/types/channels';

/**
 * Handler for any methods relating to channels.
 */
export class ChannelHandler {
	private readonly apiKey: string;

	public constructor(options: HolodexOptions) {
		this.apiKey = options.apiKey;
	}

	/**
	 * Query for a Holodex channel.
	 * @param query - The query options
	 * @returns The result of the query
	 */
	public async get(query: { channelId: string }): Promise<HolodexChannel> {
		const url = new URL(`${BASE_URL}/channels/${query.channelId}`);

		return fetchApi<HolodexChannel>(url, this.apiKey);
	}

	/**
	 * Query for Holodex channels.
	 * @param query - The query options
	 * @returns The result of the query
	 */
	public async getList(query: { limit?: number; offset?: number }): Promise<HolodexChannel[]> {
		const { limit = 100, offset = 0 } = query;

		const url = new URL(`${BASE_URL}/channels`);
		url.searchParams.append('type', 'vtuber');
		url.searchParams.append('limit', `${limit}`);
		url.searchParams.append('offset', `${offset}`);

		return fetchApi<HolodexChannel[]>(url, this.apiKey);
	}
}
