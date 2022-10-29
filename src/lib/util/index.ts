// Packages
import axios from 'axios';
import { MessageEmbed } from "discord.js";

// Types
import type { GuildMember, Guild, User, CommandInteraction } from 'discord.js';


export async function getUserInfo(
    interaction: CommandInteraction,
    userId: string
): Promise<MessageEmbed> {
    const user = await interaction.client.users.fetch(userId, { force: true });
    const member = await interaction.guild!.members.fetch(userId).catch(() => null);
    const userBanner = await getUserBannerUrl(user);
    const embed = new MessageEmbed()
        .setAuthor({ name: `${user.tag} - ${user.id}` })
        .setImage(userBanner!)
        .setTimestamp();

    const bot = user.bot ? ':robot: Bot' : ':person_standing: Human';
    const createdAt = `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`;

    if (member) {
        let avatar = await getMemberAvatarUrl(member);
        if (!avatar) avatar = await getUserAvatarUrl(user)

        const formattedRoles = member.roles.cache.size === 0 ?
            '\u200B' :
            (member.roles.cache.sort((a, b) => a.position - b.position)
                .map(role => ` <@&${role.id}>`))
                .reverse().slice(0, -1).toString();

        return embed.setColor(member.roles?.color?.color || member.displayHexColor || '#006BFC')
            .setThumbnail(avatar || 'https://i.imgur.com/ikwmld2.jpg')
            .setDescription(`<@${user.id}> | ${bot}`)
            .addFields(
                { name: 'Created at:', value: createdAt, inline: true },
                { name: 'Joined at:', value: `<t:${Math.round(member.joinedTimestamp! / 1000)}:F>`, inline: true },
                { name: `Roles (${member.roles.cache.size - 1})`, value: `${formattedRoles}` },
                { name: 'Custom status:', value: member.presence?.activities?.[0]?.state || 'N/A', inline: true },
            )
            .setFooter({ text: 'Present in server: ✔️' });

    } else {
        const avatar = await getUserAvatarUrl(user);
        const banned = await interaction.guild!.bans.fetch(userId).then(ban => {
            return `:white_check_mark: User is banned\nReason: ${ban.reason}`;
        }).catch(() => { return ':x: User is not banned'; });

        return embed.setColor('RED')
            .setThumbnail(avatar || 'https://i.imgur.com/W1TlEwP.jpg')
            .setDescription(`<@${user.id}> | ${bot}`)
            .addFields(
                { name: 'Created at:', value: createdAt },
                { name: '\u200B', value: '\u200B' },
                { name: 'Ban status:', value: `${banned}`, inline: true },
            )
            .setFooter({ text: 'Present in server: ❌' });
    }
}

export async function getUserBannerUrl(
    user: User,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 } = {}
): Promise<string | null> {
    if (!user.banner) return null;

    const query = `?size=${size}`;
    const baseUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`;

    if (dynamicFormat) {
        const { headers } = await axios.head(baseUrl);
        if (headers && headers.hasOwnProperty('content-type')) {
            return baseUrl + (headers['content-type'] == 'image/gif' ? '.gif' : `.${defaultFormat}`) + query;
        }
    }

    return baseUrl + `.${defaultFormat}` + query;
}

export async function getUserAvatarUrl(
    user: User,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 } = {}
): Promise<string | null> {
    if (!user.avatar) return null;

    const query = `?size=${size}`;
    const baseUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;

    if (dynamicFormat) {
        const { headers } = await axios.head(baseUrl);
        if (headers && headers.hasOwnProperty('content-type')) {
            return baseUrl + (headers['content-type'] == 'image/gif' ? '.gif' : `.${defaultFormat}`) + query;
        }
    }

    return baseUrl + `.${defaultFormat}` + query;
}

export async function getMemberAvatarUrl(
    member: GuildMember,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 } = {}
): Promise<string | null> {
    if (!member.avatar) return null;

    const query = `?size=${size}`;
    const baseUrl = `https://cdn.discordapp.com/guilds/${member.guild.id}/users/${member.id}/avatars/${member.avatar}`;

    if (dynamicFormat) {
        const { headers } = await axios.head(baseUrl);
        if (headers && headers.hasOwnProperty('content-type')) {
            return baseUrl + (headers['content-type'] == 'image/gif' ? '.gif' : `.${defaultFormat}`) + query;
        }
    }

    return baseUrl + `.${defaultFormat}` + query;
}

export async function getServerIcon(
    guild: Guild,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 } = {}
): Promise<string | null> {
    if (!guild.icon) return null;

    const query = `?size=${size}`;
    const baseUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`;

    if (dynamicFormat) {
        const { headers } = await axios.head(baseUrl);
        if (headers && headers.hasOwnProperty('content-type')) {
            return baseUrl + (headers['content-type'] == 'image/gif' ? '.gif' : `.${defaultFormat}`) + query;
        }
    }

    return baseUrl + `.${defaultFormat}` + query;
}
