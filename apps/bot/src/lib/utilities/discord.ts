import { isNullOrUndefined } from '#utils/functions';
import { CreditType } from '#utils/customIds';
import { BlankSpace, EmbedColors, GuildEmoteSlots, GuildSoundboardSlots, GuildStickerSlots, KBotEmoji } from '#utils/constants';
import { EmbedBuilder, MessageType, PermissionFlagsBits, User, isJSONEncodable } from 'discord.js';
import { roleMention, time, userMention } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import type {
	APIUser,
	ButtonInteraction,
	Collection,
	CommandInteraction,
	Emoji,
	Guild,
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

export function encode<T>(data: JSONEncodable<T> | T): T {
	return isJSONEncodable(data) ? data.toJSON() : data;
}

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

export const getGuildEmoteSlots = (tier: GuildPremiumTier): number => GuildEmoteSlots[tier];

export const getGuildStickerSlots = (tier: GuildPremiumTier): number => GuildStickerSlots[tier];

export const getGuildSoundboardSlots = (tier: GuildPremiumTier): number => GuildSoundboardSlots[tier];

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

export async function transformLoginData({ user, guilds }: LoginData): Promise<TransformedLoginData> {
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

export async function canManageGuildFilter(guild: Guild | RESTAPIPartialCurrentUserGuild, userId: string): Promise<boolean> {
	const fetchedGuild = container.client.guilds.cache.get(guild.id);
	if (!fetchedGuild) return false;

	const member = await fetchedGuild.members.fetch(userId).catch(() => null);
	return canManageGuild(fetchedGuild, member);
}

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

export function isWebhookMessage(message: Message): boolean {
	if (isNullOrUndefined(message.webhookId)) return false;
	return message.type === MessageType.Default;
}

export function rolesToString(roles: Collection<Snowflake, Role>): string {
	return roles.size <= 1
		? BlankSpace
		: roles
				.sort((a, b) => b.position - a.position)
				.map((role) => ` ${roleMention(role.id)}`)
				.slice(0, -1)
				.toString();
}

export async function getUserInfo(interaction: ButtonInteraction | CommandInteraction, userId: string): Promise<EmbedBuilder> {
	const user = await interaction.client.users.fetch(userId, { force: true });
	const member = await interaction.guild?.members.fetch(userId).catch(() => null);
	const userBanner = getUserBannerUrl(user);
	const embed = new EmbedBuilder()
		.setAuthor({ name: `${user.tag} - ${user.id}` })
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

export function getUserAvatarUrl(user: APIUser | User, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string {
	if (user instanceof User) {
		return user.avatar //
			? user.avatarURL({ forceStatic, size, extension: 'png' })!
			: user.defaultAvatarURL;
	}
	return user.avatar ?? createDefaultAvatar();
}

export function getMemberAvatarUrl(member: GuildMember, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string {
	return member.avatar //
		? member.avatarURL({ forceStatic, size, extension: 'png' })!
		: getUserAvatarUrl(member.user, { forceStatic, extension: 'png' });
}

export function createDefaultAvatar(): string {
	return `https://cdn.discordapp.com/embed/avatars/${Math.random() * 4}.png`;
}

export function getUserBannerUrl(user: User, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string | null | undefined {
	return user.bannerURL({ forceStatic, size, extension: 'png' });
}

export function getGuildIcon(guild: Guild | null, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string | undefined {
	return guild?.iconURL({ forceStatic, size, extension: 'png' }) ?? undefined;
}