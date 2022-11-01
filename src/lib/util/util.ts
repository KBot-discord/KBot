// Imports
import { Message, MessageEmbed } from 'discord.js';
import { Duration } from '@sapphire/duration';

// Types
import type {
    GuildMember,
    Guild,
    User,
    CommandInteraction,
} from 'discord.js';
import type { ImageOptions } from '../types/util';


export function parseTimeString(input: string | null): number | null {
    if (!input) return null;
    const { offset } = new Duration(input);
    if (!offset) return null;
    return Date.now() + offset;
}

export function calculatePollResults(message: Message) {
    const results = []; let sum = 0;
    const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const splitChoices = message.embeds[0].description!.split('\n');
    const cleanChoices = splitChoices
        .filter((e) => e)
        .map((e) => e.substring(3, e.length));

    const reactCount = message.reactions.cache
        .filter((emote) => numbers.includes(emote.emoji.name!))
        .map((e) => e.count - 1);
    for (const num of reactCount) {
        sum += num;
    }

    for (let j = 0; j < reactCount.length; j++) {
        let plural = 'votes';
        const v = Math.fround(reactCount[j] / sum);
        const amount = Math.round(v * 20);

        let percent: string = Math.fround(v * 100).toFixed(2);
        let bar = '▓'.repeat(amount) + '░'.repeat(20 - amount);

        if (reactCount[j] === 1) plural = 'vote';
        if (sum === 0) {
            percent = '0';
            bar = '░'.repeat(20);
        }

        const index = `**${cleanChoices[j]}**\n${bar} ${percent}% (${reactCount[j]} ${plural})`;
        results.push(index);
    }
    return results;
}

export async function getUserInfo(
    interaction: CommandInteraction,
    userId: string,
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
        const avatar = await getMemberAvatarUrl(member);

        const formattedRoles = member.roles.cache.size <= 1
            ? '\u200B'
            : (member.roles.cache.sort((a, b) => b.position - a.position)
                .map((role) => ` <@&${role.id}>`))
                .slice(0, -1).toString();

        return embed.setColor(member.roles?.color?.color || member.displayHexColor || '#006BFC')
            .setThumbnail(avatar || 'https://i.imgur.com/ikwmld2.jpg')
            .setDescription(`<@${user.id}> | ${bot}`)
            .addFields(
                { name: 'Created at:', value: createdAt, inline: true },
                { name: 'Joined at:', value: `<t:${Math.round(member.joinedTimestamp! / 1000)}:F>`, inline: true },
                { name: `Roles (${member.roles.cache.size - 1})`, value: formattedRoles },
            )
            .setFooter({ text: 'Present in server: ✔️' });

    }
        const avatar = await getUserAvatarUrl(user);
        const banned = await interaction.guild!.bans.fetch(userId).then((ban) => `:white_check_mark: User is banned\nReason: ${ban.reason}`).catch(() => ':x: User is not banned');

        return embed.setColor('RED')
            .setThumbnail(avatar || 'https://i.imgur.com/W1TlEwP.jpg')
            .setDescription(`<@${user.id}> | ${bot}`)
            .addFields(
                { name: 'Created at:', value: createdAt },
                { name: '\u200B', value: '\u200B' },
                { name: 'Ban status:', value: banned, inline: true },
            )
            .setFooter({ text: 'Present in server: ❌' });

}

export async function getUserAvatarUrl(
    user: User,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 }: ImageOptions = {},
): Promise<string> {
    return user.avatar
        ? user.avatarURL({ dynamic: dynamicFormat, format: defaultFormat, size })!
        : user.defaultAvatarURL;
}

export async function getMemberAvatarUrl(
    member: GuildMember,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 }: ImageOptions = {},
): Promise<string> {
    return member.avatar
        ? member.avatarURL({ dynamic: dynamicFormat, format: defaultFormat, size })!
        : getUserAvatarUrl(member.user, { dynamicFormat, defaultFormat, size });
}

export async function getUserBannerUrl(
    user: User,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 }: ImageOptions = {},
): Promise<string | null> {
    return user.bannerURL({ dynamic: dynamicFormat, format: defaultFormat, size });
}

export async function getServerIcon(
    guild: Guild,
    { dynamicFormat = true, defaultFormat = 'webp', size = 512 }: ImageOptions = {},
): Promise<string | null> {
    return guild.iconURL({ dynamic: dynamicFormat, format: defaultFormat, size });
}
