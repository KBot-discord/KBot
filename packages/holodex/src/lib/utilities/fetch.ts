import { APIKEY_HEADER } from './constants';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';

export async function fetchApi<T = unknown>(url: URL, apiKey: string): Promise<T> {
	return fetch<T>(
		url.href,
		{
			method: FetchMethods.Get,
			headers: {
				'Content-Type': 'application/json',
				[APIKEY_HEADER]: apiKey
			}
		},
		FetchResultTypes.JSON
	);
}
