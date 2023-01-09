import { guildEmoteSlots } from './constants';
import { EmbedBuilder, GuildPremiumTier } from 'discord.js';
import { Duration } from '@sapphire/duration';
import type { CommandInteraction, Guild, GuildMember, User } from 'discord.js';

interface ImageOptions {
	forceStatic?: boolean;
}

export const getGuildEmoteSlots = (tier: GuildPremiumTier): number => guildEmoteSlots[tier];

export function minutesFromNow(minutes: number, time?: number) {
	if (time) return Math.floor((time + minutes * 60000) / 1000);
	return Math.floor((Date.now() + minutes * 60000) / 1000);
}

export function parseTimeString(input: string | null): number | null {
	if (!input) return null;
	const duration = new Duration(input);
	return isNaN(duration.offset) ? null : duration.offset;
}

export async function getUserInfo(interaction: CommandInteraction, userId: string): Promise<EmbedBuilder> {
	const user = await interaction.client.users.fetch(userId, { force: true });
	const member = await interaction.guild!.members.fetch(userId).catch(() => null);
	const userBanner = await getUserBannerUrl(user);
	const embed = new EmbedBuilder()
		.setAuthor({ name: `${user.tag} - ${user.id}` })
		.setImage(userBanner!)
		.setTimestamp();

	const bot = user.bot ? ':robot: Bot' : ':person_standing: Human';
	const createdAt = `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`;

	if (member) {
		const avatar = getMemberAvatarUrl(member);

		const formattedRoles =
			member.roles.cache.size <= 1
				? '\u200B'
				: member.roles.cache
						.sort((a, b) => b.position - a.position)
						.map((role) => ` <@&${role.id}>`)
						.slice(0, -1)
						.toString();

		return embed
			.setColor(member.roles?.color?.color || member.displayHexColor || '#006BFC')
			.setThumbnail(avatar || 'https://i.imgur.com/ikwmld2.jpg')
			.setDescription(`<@${user.id}> | ${bot}`)
			.addFields(
				{ name: 'Created at:', value: createdAt, inline: true },
				{ name: 'Joined at:', value: `<t:${Math.round(member.joinedTimestamp! / 1000)}:F>`, inline: true },
				{ name: `Roles (${member.roles.cache.size - 1})`, value: formattedRoles }
			)
			.setFooter({ text: 'Present in server: ✔️' });
	}
	const avatar = getUserAvatarUrl(user);
	const banned = await interaction
		.guild!.bans.fetch(userId)
		.then((ban) => `:white_check_mark: User is banned\nReason: ${ban.reason}`)
		.catch(() => ':x: User is not banned');

	return embed
		.setColor('Red')
		.setThumbnail(avatar || 'https://i.imgur.com/W1TlEwP.jpg')
		.setDescription(`<@${user.id}> | ${bot}`)
		.addFields(
			{ name: 'Created at:', value: createdAt },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Ban status:', value: banned, inline: true }
		)
		.setFooter({ text: 'Present in server: ❌' });
}

export function getUserAvatarUrl(user: User, { forceStatic = false }: ImageOptions = {}): string {
	return user.avatar ? user.avatarURL({ forceStatic })! : user.defaultAvatarURL;
}

export function getMemberAvatarUrl(member: GuildMember, { forceStatic = false }: ImageOptions = {}): string {
	return member.avatar ? member.avatarURL({ forceStatic })! : getUserAvatarUrl(member.user, { forceStatic });
}

export function getUserBannerUrl(user: User, { forceStatic = false }: ImageOptions = {}): string | null | undefined {
	return user.bannerURL({ forceStatic });
}

export function getServerIcon(guild: Guild, { forceStatic = false }: ImageOptions = {}): string | null {
	return guild.iconURL({ forceStatic });
}
