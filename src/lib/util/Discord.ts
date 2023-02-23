import { EmbedColors, Emoji, guildEmoteSlots } from '#utils/constants';
import { EmbedBuilder, MessageType } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { roleMention, time, userMention } from '@discordjs/builders';
import type {
	Message,
	Guild,
	GuildMember,
	User,
	ButtonInteraction,
	CommandInteraction,
	GuildPremiumTier,
	Collection,
	Role,
	Snowflake
} from 'discord.js';
import type { ImageURLOptions } from '@discordjs/rest';

export const getGuildEmoteSlots = (tier: GuildPremiumTier): number => guildEmoteSlots[tier];

export function isWebhookMessage(message: Message): boolean {
	if (isNullish(message.webhookId)) return false;
	return message.type === MessageType.Default;
}

export function rolesToString(roles: Collection<Snowflake, Role>): string {
	return roles.size <= 1
		? '\u200B'
		: roles
				.sort((a, b) => b.position - a.position)
				.map((role) => ` ${roleMention(role.id)}`)
				.slice(0, -1)
				.toString();
}

export async function getUserInfo(interaction: CommandInteraction<'cached'> | ButtonInteraction<'cached'>, userId: string): Promise<EmbedBuilder> {
	const user = await interaction.client.users.fetch(userId, { force: true });
	const member = await interaction.guild.members.fetch(userId).catch(() => null);
	const userBanner = await getUserBannerUrl(user);
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
				{ name: 'Joined at:', value: time(Math.round(member.joinedTimestamp! / 1000), 'F'), inline: true },
				{ name: `Roles (${member.roles.cache.size - 1})`, value: rolesToString(member.roles.cache) }
			)
			.setFooter({ text: `Present in server: ${Emoji.GreenCheck}` });
	}
	const banned = await interaction.guild.bans
		.fetch(userId)
		.then((ban) => `${Emoji.GreenCheck} User is banned\nReason: ${ban.reason}`)
		.catch(() => `${Emoji.RedX} User is not banned`);

	return embed
		.setColor(EmbedColors.Error)
		.setThumbnail(getUserAvatarUrl(user))
		.setDescription(`${userMention(user.id)} | ${bot}`)
		.addFields(
			{ name: 'Created at:', value: createdAt },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Ban status:', value: banned, inline: true }
		)
		.setFooter({ text: `Present in server: ${Emoji.RedX}` });
}

export function getUserAvatarUrl(user: User, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string {
	return user.avatar //
		? user.avatarURL({ forceStatic, size, extension: 'png' })!
		: user.defaultAvatarURL;
}

export function getMemberAvatarUrl(member: GuildMember, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string {
	return member.avatar //
		? member.avatarURL({ forceStatic, size })!
		: getUserAvatarUrl(member.user, { forceStatic, extension: 'png' });
}

export function getUserBannerUrl(user: User, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string | null | undefined {
	return user.bannerURL({ forceStatic, size, extension: 'png' });
}

export function getGuildIcon(guild: Guild | null, { forceStatic = false, size = 512 }: ImageURLOptions = {}): string | undefined {
	return guild?.iconURL({ forceStatic, size, extension: 'png' }) ?? undefined;
}
