import { setTimeout } from 'node:timers';
import { Duration } from '@sapphire/duration';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { isNullOrUndefined } from '@sapphire/utilities';

/**
 * Convert an object to a Record where the keys are the flattened properties.
 * @param object - The object to flatten
 */

// biome-ignore lint/suspicious/noExplicitAny:
export function flattenObject(object: Record<PropertyKey, any>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in object) {
		// biome-ignore lint/suspicious/noPrototypeBuiltins:
		if (!object.hasOwnProperty(key)) continue;

		const val = object[key];
		if (typeof val === 'object' && !Array.isArray(val)) {
			const temp = flattenObject(val);
			for (const j in temp) {
				// biome-ignore lint/suspicious/noPrototypeBuiltins:
				if (!temp.hasOwnProperty(j)) continue;

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
		// biome-ignore lint/suspicious/noPrototypeBuiltins:
		if (!object.hasOwnProperty(key)) continue;

		const val = object[key];
		if (typeof val === 'object' && !isNullOrUndefined(val)) {
			const depth = checkDepth(object[key] as Record<string, unknown>) + 1;
			level = Math.max(depth, level);
		}
	}

	return level;
}

/**
 * Parse a string for a duration.
 * @param input - The string to parse
 */
export function parseTimeString(input: string | null): number | null {
	if (isNullOrUndefined(input)) return input;
	const duration = new Duration(input);
	return Number.isNaN(duration.offset) ? null : duration.offset;
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

export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
	let wait = false;

	return function handle(this: unknown, ...args: Parameters<T>) {
		if (wait) return;

		fn.apply(this, args);
		wait = true;

		setTimeout(() => {
			wait = false;
		}, delay);
	} as T;
}
