import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { isNullOrUndefined } from '@sapphire/utilities';

/**
 * Convert an object to a Record where the keys are the flattened properties.
 * @param object - The object to flatten
 */

// biome-ignore lint/suspicious/noExplicitAny: Messy
export function flattenObject(object: Record<PropertyKey, any>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in object) {
		if (!Object.hasOwn(object, key)) continue;

		const val = object[key];
		if (typeof val === 'object' && !Array.isArray(val)) {
			const temp = flattenObject(val);
			for (const j in temp) {
				if (!Object.hasOwn(temp, j)) continue;

				result[`${key}.${j}`] = temp[j];
			}
		} else {
			result[key] = val;
		}
	}

	return result;
}

/**
 * Get the depth of an object.
 * @param object - The object to check
 */
export function checkDepth(object: Record<string, unknown>): number {
	let level = 1;

	for (const key in object) {
		if (!Object.hasOwn(object, key)) continue;

		const val = object[key];
		if (typeof val === 'object' && !isNullOrUndefined(val)) {
			const depth = checkDepth(object[key] as Record<string, unknown>) + 1;
			level = Math.max(depth, level);
		}
	}

	return level;
}

/**
 * Fetch an image from a URL and convert it to a base64 string.
 * @param url - The URL of the image
 */
export async function fetchBase64Image(url: string): Promise<{ url: string; fileType: string } | null> {
	const response = await fetch(url, FetchResultTypes.Result).catch(() => null);
	const contentType = response?.headers.get('content-type');
	if (!(response && contentType)) return null;

	const resType = contentType.match(/\/\S*(png|jpg|gif)/);
	if (!resType) return null;

	const buffer = Buffer.from(await response.arrayBuffer()).toString('base64');

	return {
		url: `data:${contentType};base64,${buffer}`,
		fileType: resType[1],
	};
}
