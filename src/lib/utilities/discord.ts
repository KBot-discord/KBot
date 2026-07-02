import type { ImageURLOptions } from '@discordjs/rest';
import { UserError } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import type { APIUser, Guild, GuildMember, GuildPremiumTier, Message } from 'discord.js';
import { User } from 'discord.js';
import { GuildEmoteSlots, GuildStickerSlots } from './constants.js';
import { checkDepth } from './functions.js';

/**
 * Builds a custom ID string with a prefix and optional data object.
 *
 * @param prefix - The prefix for the custom ID.
 * @param data - The data object to include in the custom ID.
 * @returns The generated custom ID string.
 */
export function buildCustomId<T extends Record<string, unknown> = Record<string, unknown>>(
	prefix: string,
	data?: T,
): string {
	if (isNullOrUndefined(data)) return prefix;
	if (checkDepth(data) > 1) {
		throw new UserError({
			identifier: 'INVALID_DEPTH',
			message: 'Data can only have a depth of 1',
		});
	}

	const values = Object.entries(data as Record<string, string>) //
		.map(([key, val]) => `${key}:${val}`);

	const result = `${prefix};${values.toString()}`;
	if (result.length > 100) {
		throw new UserError({
			identifier: 'INVALUD_CUSTOMID',
			message: 'Custom IDs can only have a length of 100',
		});
	}

	return result;
}

/**
 * Parses a custom ID string and returns an object with the prefix and parsed data.
 *
 * @param customId - The custom ID string to parse.
 * @returns An object with the prefix and parsed data.
 */
export function parseCustomId<T = Record<string, unknown>>(customId: string): { prefix: string; data: T } {
	const { 0: prefix, 1: data } = customId.split(';');

	const parsedData = data
		.split(',') //
		.reduce<Record<string, unknown>>((acc, cur) => {
			const [key, val] = cur.split(':');

			if (val === 'undefined') {
				acc[key] = undefined;
			} else if (val === 'null') {
				acc[key] = null;
			} else {
				acc[key] = val;
			}

			return acc;
		}, {}) as T;

	return { prefix, data: parsedData };
}

/**
 * Get the emote slot count from a guild's premium tier.
 * @param tier - The guild's premium tier
 */
export const getGuildEmoteSlots = (tier: GuildPremiumTier): number => GuildEmoteSlots[tier];

/**
 * Get the sticker slot count from a guild's premium tier.
 * @param tier - The guild's premium tier
 */
export const getGuildStickerSlots = (tier: GuildPremiumTier): number => GuildStickerSlots[tier];

/**
 * Calcuate how many emoji slots are left in the guild.
 * @param guild - The guild
 */
export function calculateEmoteSlots(guild: Guild): { staticSlots: number; animatedSlots: number; totalSlots: number } {
	const allEmojis = guild.emojis.cache;
	const totalSlots = getGuildEmoteSlots(guild.premiumTier);
	const animatedEmojiCount = allEmojis.filter((e) => Boolean(e.animated)).size;

	return {
		staticSlots: totalSlots - (allEmojis.size - animatedEmojiCount),
		animatedSlots: totalSlots - animatedEmojiCount,
		totalSlots,
	};
}

/**
 * Calcuate how many sticker slots are left in the guild.
 * @param guild - The guild
 */
export function calculateStickerSlots(guild: Guild): { slotsLeft: number; totalSlots: number } {
	const allStickers = guild.stickers.cache;
	const totalSlots = getGuildStickerSlots(guild.premiumTier);

	return {
		slotsLeft: totalSlots - allStickers.size,
		totalSlots,
	};
}

/**
 * Get the first attachment from a message.
 * @param message - The message
 */
export function attachmentFromMessage(message: Message): { url: string; fileType: string } | null {
	const attachmentUrl = message.attachments.at(0)?.url;
	if (isNullOrUndefined(attachmentUrl)) return null;

	const parsedUrl = attachmentUrl.match(/([a-zA-Z0-9]+)(.png|.jpg|.gif)$/);
	if (isNullOrUndefined(parsedUrl)) return null;

	return {
		url: attachmentUrl,
		fileType: parsedUrl[2],
	};
}

/**
 * Get the URL of a user's avatar
 * @param user - The user
 * @param options - The image options for the avatar
 */
export function getUserAvatarUrl(user: APIUser | User, options: ImageURLOptions = {}): string {
	const { forceStatic = false, size = 512 } = options;

	if (user instanceof User) {
		if (user.avatar) {
			// biome-ignore lint/style/noNonNullAssertion: whatever
			return user.avatarURL({ forceStatic, size, extension: 'png' })!;
		}

		return user.defaultAvatarURL;
	}

	return user.avatar ?? createDefaultAvatar();
}

/**
 * Get the URL of a member's avatar.
 * @param member - The member
 * @param options - The image options for the avatar
 *
 * @remarks If the member has a server avatar, that is what will be returned.
 */
export function getMemberAvatarUrl(member: GuildMember, options: ImageURLOptions = {}): string {
	const { forceStatic = false, size = 512 } = options;

	if (member.avatar) {
		// biome-ignore lint/style/noNonNullAssertion: whatever
		return member.avatarURL({ forceStatic, size, extension: 'png' })!;
	}

	return getUserAvatarUrl(member.user, { forceStatic, extension: 'png' });
}

/**
 * Create a default avatar.
 */
export function createDefaultAvatar(): string {
	return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`;
}
