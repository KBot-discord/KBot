import { Duration } from '@sapphire/duration';
import { FetchResultTypes, fetch } from '@sapphire/fetch';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
export function isFunction(object: any): object is Function {
	return typeof object === 'function';
}

/**
 * Checks if a value is null or undefined.
 * @param value - The value to check
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

/**
 * Checks if a value is null, undefined, or empty.
 * @param value - The value to check
 */
export function isNullOrUndefinedOrEmpty(value: unknown): value is '' | null | undefined {
	return isNullOrUndefined(value) || (value as unknown[] | string).length === 0;
}

/**
 * Convert an object to a Record where the keys are the flattened properties.
 * @param object - The object to flatten
 */
export function flattenObject(object: Record<any, any>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const i in object) {
		if (!object.hasOwnProperty(i)) continue;
		if (typeof object[i] === 'object' && !Array.isArray(object[i])) {
			const temp = flattenObject(object[i]);
			for (const j in temp) {
				if (!temp.hasOwnProperty(j)) continue;
				result[`${i}.${j}`] = temp[j];
			}
		} else {
			result[i] = object[i];
		}
	}

	return result;
}

/**
 * Parse a string for a duration.
 * @param input - The string to parse
 */
export function parseTimeString(input: string | null): number | null {
	if (!input) return null;
	const duration = new Duration(input);
	return isNaN(duration.offset) ? null : duration.offset;
}

/**
 * Builds a custom ID and appends extra data.
 * @param prefix - The prefix of the custom ID
 * @param data - The data to add
 */
export function buildCustomId<T = unknown>(prefix: string, data?: T): string {
	if (isNullOrUndefined(data)) return prefix;

	const values = Object.entries(data as Record<string, string>) //
		.map(([key, val]) => `${key}:${val}`);
	return `${prefix};${values.toString()}`;
}

/**
 * Parses a custom ID and returns the prefix and data.
 * @param customId - The custom ID to parse
 */
export function parseCustomId<T = unknown>(customId: string): { prefix: string; data: T } {
	const { 0: prefix, 1: data } = customId.split(';');

	const parsedData = data
		.split(',') //
		.reduce<Record<string, string>>((acc, cur) => {
			const [key, val] = cur.split(':');
			acc[key] = val;
			return acc;
		}, {}) as T;

	return { prefix, data: parsedData };
}

/**
 * Fetch an image from a URL and convert it to a base64 string.
 * @param url - The URL of the image
 */
export async function fetchBase64Image(url: string): Promise<{ url: string; fileType: string } | null> {
	const response = await fetch(url, FetchResultTypes.Result).catch(() => null);
	const contentType = response?.headers.get('content-type');
	if (!response || !contentType) return null;

	const resType = contentType.match(/\/\S*(png|jpg|gif)/);
	if (!resType) return null;

	const buffer = Buffer.from(await response.arrayBuffer()).toString('base64');

	return {
		url: `data:${contentType};base64,${buffer}`,
		fileType: resType[1]
	};
}
