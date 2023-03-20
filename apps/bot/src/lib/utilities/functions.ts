import { Duration, Time } from '@sapphire/duration';

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
	return Math.floor(((time ?? Date.now()) + minutes * Time.Minute) / 1000);
}

export function parseTimeString(input: string | null): number | null {
	if (!input) return null;
	const duration = new Duration(input);
	return isNaN(duration.offset) ? null : duration.offset;
}
