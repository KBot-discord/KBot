import { getGuildStickerSlots } from '../../../src/lib/utilities/discord.js';
import { describe, expect, test } from 'vitest';
import { GuildPremiumTier } from 'discord.js';

describe('getGuildStickerSlots', () => {
	test('IF no tier THEN 5', () => {
		const result = getGuildStickerSlots(GuildPremiumTier.None);

		expect(result).toBe(5);
	});

	test('IF no tier THEN 15', () => {
		const result = getGuildStickerSlots(GuildPremiumTier.Tier1);

		expect(result).toBe(15);
	});

	test('IF no tier THEN 30', () => {
		const result = getGuildStickerSlots(GuildPremiumTier.Tier2);

		expect(result).toBe(30);
	});

	test('IF no tier THEN 60', () => {
		const result = getGuildStickerSlots(GuildPremiumTier.Tier3);

		expect(result).toBe(60);
	});
});
