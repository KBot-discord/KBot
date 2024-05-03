import { buildCustomId } from '../../../src/lib/utilities/discord.js';
import { mockCustomId, mockCustomIdAlt } from '../../mocks/discord.js';
import { describe, expect, test } from 'vitest';
import { UserError } from '@sapphire/framework';

describe('buildCustomId', () => {
	test('IF prefix with no data THEN custom ID', () => {
		const result = buildCustomId('custom-id');

		expect(result).toStrictEqual('custom-id');
	});

	test('IF prefix with data THEN custom ID', () => {
		const result = buildCustomId('custom-id', {
			key1: 'val1',
			key2: 'val2',
			key3: 'val3'
		});

		expect(result).toStrictEqual(mockCustomId);
	});

	test('IF prefix with alt data THEN custom ID', () => {
		const result = buildCustomId('custom-id', {
			key1: undefined,
			key2: null,
			key3: 'val3'
		});

		expect(result).toStrictEqual(mockCustomIdAlt);
	});

	test('IF prefix with invalid data THEN UserError', () => {
		const result = (): string => {
			return buildCustomId('custom-id', {
				key1: undefined,
				key2: null,
				key3: {
					key4: 'val4'
				}
			});
		};

		expect(result).toThrowError(UserError);
	});

	test('IF prefix with too much data THEN UserError', () => {
		const result = (): string => {
			return buildCustomId('custom-id', {
				key1: 'this is a long string',
				key2: 'this is a long string',
				key3: 'this is a long string',
				key4: 'this is a long string',
				key5: 'this is a long string',
				key6: 'this is a long string',
				key7: 'this is a long string',
				key8: 'this is a long string',
				key9: 'this is a long string',
				key10: 'this is a long string'
			});
		};

		expect(result).toThrowError(UserError);
	});
});
