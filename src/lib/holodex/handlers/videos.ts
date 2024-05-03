import { BASE_URL } from '../utilities/constants.js';
import { fetchApi } from '../utilities/fetch.js';
import type { HolodexVideoWithChannel } from '../types/videos.js';
import type { HolodexOptions } from '../structures/Holodex.js';

/**
 * Handler for any methods relating to videos.
 */
export class VideoHandler {
	private readonly apiKey: string;

	public constructor(options: HolodexOptions) {
		this.apiKey = options.apiKey;
	}

	/**
	 * Get the current live channels.
	 * @param query - The query options
	 * @returns The result of the query
	 */
	public async getLive(query: { channels: string[] }): Promise<HolodexVideoWithChannel[]> {
		const url = new URL(`${BASE_URL}/users/live`);
		url.searchParams.append('channels', query.channels.toString());

		return await fetchApi<HolodexVideoWithChannel[]>(url, this.apiKey);
	}
}
