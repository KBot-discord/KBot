import { getMemberAvatarUrl, getServerIcon } from '#utils/util';
import { EmbedColors } from '#utils/constants';
import { container } from '@sapphire/framework';
import { GuildTextBasedChannel, MessageEmbed } from 'discord.js';
import { userMention } from '@discordjs/builders';
import type { GuildMember } from 'discord.js';
import type { BanContext, KickContext, ModerationLogContext, MuteContext, TimeoutContext } from '#lib/types/Moderation';
import type { ModerationModule } from '@prisma/client';

export const enum ModerationActionType {
	Ban = 'ban',
	Kick = 'kick',
	Mute = 'mute',
	Timeout = 'timeout',
	Unban = 'unban',
	Unmute = 'unmute',
	Untimeout = 'untimeout'
}

export class ModerationAction {
	public readonly config: ModerationModule;
	public readonly moderator: GuildMember;
	public readonly target: GuildMember;

	public constructor(config: ModerationModule, moderator: GuildMember, target: GuildMember) {
		this.config = config;
		this.moderator = moderator;
		this.target = target;
	}

	public async ban({ reason, dm, silent, daysToPurge }: BanContext): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';

		if (dm) dmResult = await this.sendDm(`You have been banned from **${this.moderator.guild.name}**`, reason);

		if (!daysToPurge && daysToPurge !== 0) {
			daysToPurge = 1;
		}

		await this.moderator.guild.members.ban(this.target, {
			reason: `${reason || 'No reason provided'} (Banned by: ${this.target.user.tag})`,
			days: daysToPurge
		});

		if (!silent) {
			await this.logAction({
				action: ModerationActionType.Ban,
				reason
			});
		}

		return { success: true, dmResult };
	}

	public async kick({ reason, dm, silent }: KickContext): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';

		if (dm) dmResult = await this.sendDm(`You have been kicked from **${this.moderator.guild.name}**`, reason);

		await this.moderator.guild.members.kick(this.target.id, `${reason || 'No reason provided'} (Kicked by: ${this.moderator.user.tag})`);

		if (!silent) {
			await this.logAction({
				action: ModerationActionType.Kick,
				reason
			});
		}

		return { success: true, dmResult };
	}

	public async mute({ reason, dm, silent, time }: MuteContext): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';

		if (dm) dmResult = await this.sendDm(`You have been muted in **${this.moderator.guild.name}**`, reason, { isMuteOrTimeout: true, time });

		await this.target.roles.add(this.config.muteRole!, `Reason: ${reason || 'No reason provided'}. (Muted by: ${this.moderator.id})`);

		if (time) {
			// TODO create task
		}

		if (!silent) {
			await this.logAction({
				action: ModerationActionType.Mute,
				reason
			});
		}

		return { success: true, dmResult };
	}

	public async timeout({ reason, dm, silent, time }: TimeoutContext): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';

		if (dm) dmResult = await this.sendDm(`You have been muted in **${this.moderator.guild.name}**`, reason, { isMuteOrTimeout: true, time });

		await this.target.timeout(time ?? null, `${reason || 'No reason provided'} (Timed out by: ${this.moderator.user.tag})`);

		if (!silent) {
			await this.logAction({
				action: ModerationActionType.Mute,
				reason
			});
		}

		return { success: true, dmResult };
	}

	private async sendDm(
		description: string,
		reason?: string,
		{ isMuteOrTimeout, time }: { isMuteOrTimeout?: boolean; time?: number | null } = {}
	): Promise<string> {
		const { guild } = this.moderator;

		try {
			const icon = getServerIcon(guild);
			await this.target.send({
				embeds: [
					new MessageEmbed()
						.setColor(EmbedColors.Default)
						.setThumbnail(icon!)
						.setDescription(description)
						.addFields(isMuteOrTimeout ? [{ name: 'Mute ends in', value: time ? `<t:${time}:R> (<t:${time}:f>)` : 'Indefinite' }] : [])
						.addFields(reason ? [{ name: 'Reason', value: reason }] : [])
						.setTimestamp()
				]
			});
			return '✔️ DM sent';
		} catch (err) {
			return '❌ Unable to DM user';
		}
	}

	private async logAction({ action, reason, duration }: ModerationLogContext) {
		const { client, validator } = container;
		// TODO save action to db

		if (!this.config.logChannel) return;

		const modlogChannel = (await client.channels.fetch(this.config.logChannel)) as GuildTextBasedChannel | null;
		if (!modlogChannel) return;

		const isValid = validator.channels.canSendEmbeds(modlogChannel);
		if (!isValid.result) return;

		const avatar = getMemberAvatarUrl(this.target);

		const embedColor =
			action === (ModerationActionType.Unban || ModerationActionType.Unmute || ModerationActionType.Untimeout)
				? EmbedColors.Success
				: EmbedColors.Error;

		const embed = new MessageEmbed()
			.setColor(embedColor)
			.setAuthor({ name: `${action} | ${this.target.user.tag}`, iconURL: avatar })
			.addFields(
				{ name: 'User', value: `${userMention(this.target.id)}`, inline: true },
				{ name: 'Moderator', value: `${userMention(this.moderator.id)}`, inline: true },
				{ name: 'Reason', value: reason || 'No reason provided', inline: true }
			)
			.setFooter({ text: `User ID: ${this.target.id}` })
			.setTimestamp();

		if (action === (ModerationActionType.Mute || ModerationActionType.Timeout)) {
			embed.fields.splice(2, 0, { name: 'Duration', value: duration ?? 'Indefinite', inline: true });
		}

		return modlogChannel.send({ embeds: [embed] });
	}
}
