import { BASE_URL } from '../utilities/constants.js';
import { fetchApi } from '../utilities/fetch.js';
import type { HolodexChannel } from '../types/channels.js';
import type { HolodexOptions } from '../structures/Holodex.js';

/**
 * Handler for any methods relating to channels.
 */
export class ChannelHandler {
	private readonly apiKey: string;

	public constructor(options: HolodexOptions) {
		this.apiKey = options.apiKey;
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

		return await fetchApi<HolodexChannel[]>(url, this.apiKey);
	}
}
