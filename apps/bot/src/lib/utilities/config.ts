import { flattenObject } from '#utils/functions';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import type { ClientConfig } from '#types/Config';

export function validateConfig(config: ClientConfig): boolean {
	let error = false;
	const flattenedConfig = flattenObject(config);

	for (const [key, value] of Object.entries(flattenedConfig)) {
		if (!Array.isArray(value) && isNullOrUndefinedOrEmpty(value)) {
			console.error(`${key} was undefined or empty`);
			if (!error) error = true;
		}
	}

	return !error;
}

export function envGetString(key: string): string {
	return process.env[key]!;
}

export function envGetNumber(key: string): number {
	const number = Number(process.env[key]);
	if (isNaN(number)) {
		const errorString = `"${key}" must be set to a number`;
		throw new TypeError(errorString);
	}
	return number;
}
