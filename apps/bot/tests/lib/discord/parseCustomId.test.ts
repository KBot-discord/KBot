import { describe, expect, test } from 'vitest';
import { parseCustomId } from '#src/lib/utilities/discord';
import { mockCustomId, mockCustomIdAlt } from '#mocks/discord';

describe('parseCustomId', () => {
	test('IF custom ID THEN prefix with data', () => {
		const result = parseCustomId(mockCustomId);

		expect(result).toStrictEqual({
			prefix: 'custom-id',
			data: {
				key1: 'val1',
				key2: 'val2',
				key3: 'val3'
			}
		});
	});

	test('IF custom ID THEN prefix with alt data', () => {
		const result = parseCustomId(mockCustomIdAlt);

		expect(result).toStrictEqual({
			prefix: 'custom-id',
			data: {
				key1: undefined,
				key2: null,
				key3: 'val3'
			}
		});
	});
});
