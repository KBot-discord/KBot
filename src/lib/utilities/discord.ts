import type { ImageURLOptions } from '@discordjs/rest';
import type { AnyInteraction } from '@sapphire/discord.js-utilities';
import { container, UserError } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import type {
	APIUser,
	Collection,
	Guild,
	GuildBasedChannel,
	GuildMember,
	GuildPremiumTier,
	Message,
	Role,
	Snowflake,
} from 'discord.js';
import { EmbedBuilder, MessageType, roleMention, time, User, userMention } from 'discord.js';
import { BlankSpace, EmbedColors, GuildEmoteSlots, GuildStickerSlots, KBotEmoji } from './constants.js';
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
 * Checks if a message is from a webhook.
 * @param message - The message to check
 */
export function isWebhookMessage(message: Message): boolean {
	if (isNullOrUndefined(message.webhookId)) return false;
	return message.type === MessageType.Default;
}

/**
 * Convert a collection of roles to a string.
 * @param roles - The collection of roles to convert
 */
export function rolesToString(roles: Collection<Snowflake, Role>): string {
	return roles.size <= 1
		? BlankSpace
		: roles
				.sort((a, b) => b.position - a.position)
				.map((role) => ` ${roleMention(role.id)}`)
				.slice(0, -1)
				.toString();
}

/**
 * Create an info embed about a user.
 * @param interaction - An interaction
 * @param userId - The ID of the user
 */
export async function getUserInfo(interaction: AnyInteraction, userId: string): Promise<EmbedBuilder> {
	const user = await interaction.client.users.fetch(userId, { force: true });
	const member = await interaction.guild?.members.fetch(userId).catch(() => null);
	const userBanner = getUserBannerUrl(user);
	const embed = new EmbedBuilder()
		.setAuthor({ name: `@${user.username} - ${user.id}` })
		// biome-ignore lint/style/noNonNullAssertion: whatever
		.setImage(userBanner!)
		.setTimestamp();

	const bot = user.bot ? ':robot: Bot' : ':person_standing: Human';
	const createdAt = `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`;

	if (member) {
		return embed
			.setColor(member.displayHexColor === '#000000' ? EmbedColors.Default : member.displayHexColor)
			.setThumbnail(getMemberAvatarUrl(member))
			.setDescription(`${userMention(user.id)} | ${bot}`)
			.addFields(
				{ name: 'Created at:', value: createdAt, inline: true },
				{
					name: 'Joined at:',
					// biome-ignore lint/style/noNonNullAssertion: whatever
					value: time(Math.round(member.joinedTimestamp! / 1000), 'F'),
					inline: true,
				},
				{ name: `Roles (${member.roles.cache.size - 1})`, value: rolesToString(member.roles.cache) },
			)
			.setFooter({ text: `Present in server: ${KBotEmoji.GreenCheck}` });
	}

	const banned = await interaction.guild?.bans
		.fetch(userId)
		.then((ban) => `${KBotEmoji.GreenCheck} User is banned\nReason: ${ban.reason}`)
		.catch(() => `${KBotEmoji.RedX} User is not banned`);

	embed.setFields({ name: 'Created at:', value: createdAt });

	if (banned) {
		embed.addFields(
			{ name: BlankSpace, value: BlankSpace }, //
			{ name: 'Ban status:', value: banned, inline: true },
		);
	}

	return embed
		.setColor(EmbedColors.Error)
		.setThumbnail(getUserAvatarUrl(user))
		.setDescription(`${userMention(user.id)} | ${bot}`)
		.setFooter({ text: `Present in server: ${KBotEmoji.RedX}` });
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

/**
 * Get a user's banner.
 * @param user - The user
 * @param options - The image options for the banner
 */
export function getUserBannerUrl(user: User, options: ImageURLOptions = {}): string | null | undefined {
	const { forceStatic = false, size = 512 } = options;

	return user.bannerURL({ forceStatic, size, extension: 'png' });
}
/**
 * Get a guild's icon.
 * @param guild - The guild
 * @param options - The image options for the icon
 */
export function getGuildIcon(guild: Guild | null, options: ImageURLOptions = {}): string | undefined {
	const { forceStatic = false, size = 512 } = options;

	return guild?.iconURL({ forceStatic, size, extension: 'png' }) ?? undefined;
}

/**
 * Fetch a channel from the guild.
 * @param guild - The guild
 * @param channelId - The ID of the channel
 *
 * @typeParam T - The type of the channel
 */
export async function fetchChannel<T extends GuildBasedChannel>(channelId: string): Promise<T | null> {
	return container.client.channels.fetch(channelId).catch(() => null) as unknown as T | null;
}
