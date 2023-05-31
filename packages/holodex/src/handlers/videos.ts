import { BASE_URL } from '../lib/utilities/constants';
import { fetchApi } from '../lib/utilities/fetch';
import type { HolodexOptions } from '../lib/structures/Holodex';
import type { HolodexVideoWithChannel } from '../lib/types/videos';
import type { PaginatedResponse } from '../lib/types/api';

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

		return fetchApi<HolodexVideoWithChannel[]>(url, this.apiKey);
	}

	/**
	 * Get the streams in a paginated format.
	 * @param query - The query options
	 * @returns The paginated result of the query
	 */
	public async getPastPaginated(query: { from: number; to: number; offset: number }): Promise<PaginatedResponse<HolodexVideoWithChannel>> {
		const { from, to, offset } = query;

		const url = new URL(`${BASE_URL}/videos`);
		url.searchParams.append('paginated', 'true');
		url.searchParams.append('status', 'past');
		url.searchParams.append('type', 'stream');
		url.searchParams.append('limit', '100');
		url.searchParams.append('sort', 'end_actual');
		url.searchParams.append('from', new Date(from).toISOString());
		url.searchParams.append('to', new Date(to).toISOString());
		url.searchParams.append('offset', `${offset}`);

		return fetchApi<PaginatedResponse<HolodexVideoWithChannel>>(url, this.apiKey);
	}
}
