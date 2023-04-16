import { isNullish } from '@sapphire/utilities';

export * from './addEmote';
export * from './credits';
export * from './karaoke';
export * from './poll';
export * from './youtube';

export function buildCustomId<T = unknown>(prefix: string, data?: T): string {
	if (isNullish(data)) return prefix;

	const values = Object.entries(data as Record<string, string>) //
		.map(([key, val]) => `${key}:${val}`);
	return `${prefix};${values.toString()}`;
}

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
