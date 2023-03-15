import { Duration } from '@sapphire/duration';

export function flattenObject(object: any) {
	const result: any = {};

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

export function minutesFromNow(minutes: number, time?: number) {
	if (time) return Math.floor((time + minutes * 60000) / 1000);
	return Math.floor((Date.now() + minutes * 60000) / 1000);
}

export function parseTimeString(input: string | null): number | null {
	if (!input) return null;
	const duration = new Duration(input);
	return isNaN(duration.offset) ? null : duration.offset;
}
