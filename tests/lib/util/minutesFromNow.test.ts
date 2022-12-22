import { describe, expect, test } from 'vitest';
import { minutesFromNow } from '../../../src/lib/util/util';

describe('minutesFromNow', () => {
	test('GIVEN the amount of minutes from now -> RETURN proper UNIX time', () => {
		const now = Date.now();
		const result = minutesFromNow(3, now);
		expect(result).toBe(Math.floor((now + 3 * 60000) / 1000));
	});
});
