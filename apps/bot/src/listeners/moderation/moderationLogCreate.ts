import { EmbedColors } from '#utils/constants';
import { getMemberAvatarUrl, getUserAvatarUrl } from '#utils/Discord';
import { KBotEvents } from '#types/Enums';
import { ModerationActionType } from '#prisma';
import { EmbedBuilder, GuildMember } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { userMention } from '@discordjs/builders';
import humanizeDuration from 'humanize-duration';
import type { ModerationActionContext } from '#types/Moderation';
import type { ModerationSettings } from '#prisma';
import type { GuildTextBasedChannel, User } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: KBotEvents.ModerationLog
})
export class ModerationListener extends Listener {
	public async run({
		target,
		moderator,
		settings,
		data: { type, reason, expiresIn }
	}: {
		target: GuildMember | User;
		moderator: GuildMember;
		settings: ModerationSettings;
		data: ModerationActionContext;
	}): Promise<void> {
		const { client, validator } = container;
		if (isNullish(settings.logChannelId)) return;

		const modlogChannel = (await client.channels.fetch(settings.logChannelId)) as GuildTextBasedChannel | null;
		if (!modlogChannel) return;

		const { result } = await validator.channels.canSendEmbeds(modlogChannel);
		if (!result) return;

		let avatar: string;
		let tag: string;

		if (target instanceof GuildMember) {
			avatar = getMemberAvatarUrl(target);
			tag = target.user.tag;
		} else {
			avatar = getUserAvatarUrl(target);
			tag = target.tag;
		}

		const embedColor =
			type === ModerationActionType.UNBAN || type === ModerationActionType.UNMUTE || type === ModerationActionType.UNTIMEOUT
				? EmbedColors.Success
				: EmbedColors.Error;

		const embed = new EmbedBuilder()
			.setColor(embedColor)
			.setAuthor({ name: `${type} | ${tag}`, iconURL: avatar })
			.addFields(
				{ name: 'User', value: `${userMention(target.id)}`, inline: true },
				{ name: 'Moderator', value: `${userMention(moderator.id)}`, inline: true },
				{ name: 'Reason', value: reason ?? 'No reason provided', inline: true }
			)
			.setFooter({ text: `User ID: ${target.id}` })
			.setTimestamp();

		if (type === ModerationActionType.MUTE || type === ModerationActionType.TIMEOUT) {
			embed.spliceFields(2, 0, {
				name: 'Duration',
				value: expiresIn ? humanizeDuration(Number(expiresIn)) : 'Indefinite'
			});
		}

		await modlogChannel.send({ embeds: [embed] });
	}
}
