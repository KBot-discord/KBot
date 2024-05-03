import { encode } from '../../../src/lib/utilities/discord.js';
import { describe, expect, test } from 'vitest';
import type { JSONEncodable } from 'discord.js';

describe('encode', () => {
	test('IF encodeable object THEN JSON', () => {
		const mockEncodeableObject: JSONEncodable<{ key: string }> = {
			toJSON(): { key: string } {
				return { key: 'string' };
			}
		};

		const result = encode(mockEncodeableObject);

		expect(result).toStrictEqual({ key: 'string' });
	});

	test('IF unencodeable object THEN object', () => {
		const mockUnencodeableObject = {
			key: 'string'
		};

		const result = encode(mockUnencodeableObject);

		expect(result).toStrictEqual({ key: 'string' });
	});
});
