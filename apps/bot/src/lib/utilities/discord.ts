import { isNullOrUndefined } from '#utils/functions';
import { CreditType } from '#utils/customIds';
import { BlankSpace, EmbedColors, GuildEmoteSlots, GuildSoundboardSlots, GuildStickerSlots, KBotEmoji } from '#utils/constants';
import { EmbedBuilder, MessageType, PermissionFlagsBits, User, isJSONEncodable } from 'discord.js';
import { roleMention, time, userMention } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import type {
	APIUser,
	Collection,
	Emoji,
	Guild,
	GuildBasedChannel,
	GuildMember,
	GuildPremiumTier,
	JSONEncodable,
	Message,
	RESTAPIPartialCurrentUserGuild,
	Role,
	Snowflake,
	Sticker
} from 'discord.js';
import type { ImageURLOptions } from '@discordjs/rest';
import type { LoginData } from '@sapphire/plugin-api';
import type { FormattedGuild, TransformedLoginData } from '#types/Api';
import type { AnyInteraction } from '@sapphire/discord.js-utilities';

/**
 * Converts a value to JSON if it is encodeable.
 * @param data - The data to convert
 */
export function encode<T>(value: JSONEncodable<T> | T): T {
	return isJSONEncodable(value) ? value.toJSON() : value;
}

/**
 * Get an emote or sticker from its ID
 * @param guildId - The ID of the guild
 * @param resourceId - The ID of the resource
 * @param type - The type of of the resource
 */
export function getResourceFromType(guildId: string, resourceId: string, type: CreditType): Emoji | Sticker | null {
	const guild = container.client.guilds.cache.get(guildId);
	if (!guild) return null;

	if (type === CreditType.Emote) {
		const emoji = guild.emojis.cache.get(resourceId);
		if (emoji) return emoji;
	} else {
		const sticker = guild.stickers.cache.get(resourceId);
		if (sticker) return sticker;
	}

	return null;
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
 * Get the soundboard slot count from a guild's premium tier.
 * @param tier - The guild's premium tier
 */
export const getGuildSoundboardSlots = (tier: GuildPremiumTier): number => GuildSoundboardSlots[tier];

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
		fileType: parsedUrl[2]
	};
}

export async function transformLoginData(data: LoginData): Promise<TransformedLoginData> {
	const { user, guilds } = data;
	if (!user) return { user, guilds: [] };

	const formattedUser = {
		id: user.id,
		username: user.username,
		discriminator: user.discriminator,
		avatar: getUserAvatarUrl(user)
	};

	if (!guilds) return { user: formattedUser, guilds: [] };

	const formattedGuilds: FormattedGuild[] = await Promise.all(
		guilds.length > 0
			? guilds
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					.filter(async (guild) => canManageGuildFilter(guild, user.id)) //
					.map(({ id, name, icon, owner, permissions, features }) => {
						return { id, name, icon: icon ?? '', owner, permissions, features };
					})
			: []
	);

	return { user: formattedUser, guilds: formattedGuilds };
}

/**
 * Checks if a user has `Manager Server` permissions in a guild.
 * @param guild - The guild to check
 * @param userId - The ID of the user to check
 */
export async function canManageGuildFilter(guild: Guild | RESTAPIPartialCurrentUserGuild, userId: string): Promise<boolean> {
	const fetchedGuild = container.client.guilds.cache.get(guild.id);
	if (!fetchedGuild) return false;

	const member = await fetchedGuild.members.fetch(userId).catch(() => null);
	return canManageGuild(fetchedGuild, member);
}

/**
 * Checks if a member has `Manager Server` permissions in a guild.
 * @param guild - The guild to check
 * @param member - The member to check
 */
export async function canManageGuild(guild: Guild, member: GuildMember | null): Promise<boolean> {
	if (!member) return false;
	if (guild.ownerId === member.id) return true;

	try {
		const settings = await container.core.settings.get(guild.id);
		if (!settings) return false;

		return member.permissions.has(PermissionFlagsBits.ManageGuild);
	} catch (error: unknown) {
		container.logger.sentryError(error);
		return false;
	}
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
					value: time(Math.round(member.joinedTimestamp! / 1000), 'F'),
					inline: true
				},
				{ name: `Roles (${member.roles.cache.size - 1})`, value: rolesToString(member.roles.cache) }
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
			{ name: 'Ban status:', value: banned, inline: true }
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
		return user.avatar //
			? user.avatarURL({ forceStatic, size, extension: 'png' })!
			: user.defaultAvatarURL;
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

	return member.avatar //
		? member.avatarURL({ forceStatic, size, extension: 'png' })!
		: getUserAvatarUrl(member.user, { forceStatic, extension: 'png' });
}

/**
 * Create a default avatar.
 */
export function createDefaultAvatar(): string {
	return `https://cdn.discordapp.com/embed/avatars/${Math.random() * 4}.png`;
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
