import { GuildPremiumTier } from 'discord.js';
import { describe, expect, test } from 'vitest';
import { getGuildEmoteSlots } from '../../../src/lib/utilities/discord.js';

describe('getGuildEmoteSlots', () => {
	test('IF no tier THEN 50', () => {
		const result = getGuildEmoteSlots(GuildPremiumTier.None);

		expect(result).toBe(50);
	});

	test('IF no tier THEN 100', () => {
		const result = getGuildEmoteSlots(GuildPremiumTier.Tier1);

		expect(result).toBe(100);
	});

	test('IF no tier THEN 150', () => {
		const result = getGuildEmoteSlots(GuildPremiumTier.Tier2);

		expect(result).toBe(150);
	});

	test('IF no tier THEN 250', () => {
		const result = getGuildEmoteSlots(GuildPremiumTier.Tier3);

		expect(result).toBe(250);
	});
});
