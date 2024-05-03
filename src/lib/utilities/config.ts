import { flattenObject } from './functions.js';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import type { ClientConfig } from '../types/Config.js';

/**
 * Asserts that a config has no undefined values.
 * @param config - The config to check
 */
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
	const value = process.env[key];
	if (isNullOrUndefinedOrEmpty(value)) {
		const errorString = `"${key}" must be set to a string`;
		throw new TypeError(errorString);
	}

	return String(value);
}

export function envGetNumber(key: string): number {
	const value = process.env[key];
	const number = Number(value);
	if (isNullOrUndefinedOrEmpty(value) || isNaN(number)) {
		const errorString = `"${key}" must be set to a number`;
		throw new TypeError(errorString);
	}

	return number;
}
