import { describe, expect, test } from 'vitest';
import { GuildPremiumTier } from 'discord.js';
import { getGuildSoundboardSlots } from '#src/lib/utilities/discord';

describe('getGuildStickerSlots', () => {
	test('IF no tier THEN 8', () => {
		const result = getGuildSoundboardSlots(GuildPremiumTier.None);

		expect(result).toBe(8);
	});

	test('IF no tier THEN 24', () => {
		const result = getGuildSoundboardSlots(GuildPremiumTier.Tier1);

		expect(result).toBe(24);
	});

	test('IF no tier THEN 36', () => {
		const result = getGuildSoundboardSlots(GuildPremiumTier.Tier2);

		expect(result).toBe(36);
	});

	test('IF no tier THEN 48', () => {
		const result = getGuildSoundboardSlots(GuildPremiumTier.Tier3);

		expect(result).toBe(48);
	});
});
