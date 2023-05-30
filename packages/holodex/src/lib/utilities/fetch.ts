import { APIKEY_HEADER } from './constants';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';

export async function fetchApi<T = unknown>(url: URL, apiKey: string): Promise<T | null> {
	const result = await fetch(
		url.href,
		{
			method: FetchMethods.Get,
			headers: {
				'Content-Type': 'application/json',
				[APIKEY_HEADER]: apiKey
			}
		},
		FetchResultTypes.Result
	);

	if (result.status !== 200) return null;
	return (await result.json()) as T;
}