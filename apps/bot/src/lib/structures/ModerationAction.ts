import { EmbedColors } from '#utils/constants';
import { KBotEvents } from '#types/Enums';
import { getGuildIcon } from '#utils/Discord';
import { ModerationActionType } from '#prisma';
import { container } from '@sapphire/framework';
import { EmbedBuilder, User } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';
import type { BanContext, KickContext, MuteContext, TimeoutContext, UnbanContext, UnmuteContext, UntimeoutContext } from '#types/Moderation';
import type { ModerationSettings } from '#prisma';

export class ModerationAction {
	public readonly settings: ModerationSettings;
	public readonly moderator: GuildMember;

	public constructor(settings: ModerationSettings, moderator: GuildMember) {
		this.settings = settings;
		this.moderator = moderator;
	}

	public async ban(
		target: GuildMember | User,
		{ reason, sendDm, silent, daysToPurge }: BanContext
	): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';

		if (sendDm === true) {
			dmResult = await this.sendDm(target, `You have been banned from **${this.moderator.guild.name}**`, reason);
		}

		if (!daysToPurge && daysToPurge !== 0) {
			daysToPurge = 1;
		}

		await this.moderator.guild.members.ban(target, {
			reason: `${reason ?? 'No reason provided'} (Banned by: ${target instanceof User ? target.tag : target.user.tag})`,
			deleteMessageDays: daysToPurge
		});

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.BAN,
					reason
				}
			});
		}

		return { success: true, dmResult };
	}

	public async unban(target: User, { reason, sendDm, silent }: UnbanContext) {
		let dmResult = 'No DM sent';

		if (sendDm === true) {
			dmResult = await this.sendDm(target, `You have been unbanned from **${this.moderator.guild.name}**`, reason);
		}

		await this.moderator.guild.members.unban(target, `${reason ?? 'No reason provided'} (Unbanned by: ${this.moderator.user.tag})`);

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.UNBAN,
					reason
				}
			});
		}

		return { success: true, dmResult };
	}

	public async kick(target: GuildMember, { reason, sendDm, silent }: KickContext): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';

		if (sendDm === true) {
			dmResult = await this.sendDm(target, `You have been kicked from **${this.moderator.guild.name}**`, reason);
		}

		await this.moderator.guild.members.kick(target.id, `${reason ?? 'No reason provided'} (Kicked by: ${this.moderator.user.tag})`);

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.KICK,
					reason
				}
			});
		}

		return { success: true, dmResult };
	}

	public async mute(target: GuildMember, { reason, sendDm, silent, expiresIn }: MuteContext): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';
		const defaultReason = reason ?? 'No reason provided.';
		const expiresAt = expiresIn ? expiresIn + Date.now() : undefined;

		if (sendDm !== false)
			dmResult = await this.sendDm(target, `You have been muted in **${this.moderator.guild.name}**`, reason, {
				isMuteOrTimeout: 'mute',
				expiresAt
			});

		await target.roles.add(this.settings.muteRoleId!, `Reason: ${reason ?? 'No reason provided'}. (Muted by: ${this.moderator.id})`);

		await container.moderation.cases.create(target, this.moderator, {
			type: ModerationActionType.MUTE,
			reason: defaultReason,
			expiresIn
		});

		if (expiresAt) {
			container.moderation.mutes.createTask(expiresAt, { guildId: target.guild.id, userId: target.id });
		}

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.MUTE,
					reason,
					expiresIn
				}
			});
		}

		return { success: true, dmResult };
	}

	public async unmute(target: GuildMember, { reason, sendDm, silent }: UnmuteContext) {
		let dmResult = 'No DM sent';

		if (sendDm !== false) {
			dmResult = await this.sendDm(target, `You have been unmuted in **${this.moderator.guild.name}**`, reason);
		}

		await target.roles.remove(this.settings.muteRoleId!, `Reason: ${reason ?? 'No reason provided'}. (Unmuted by: ${this.moderator.user.tag})`);

		await container.moderation.mutes.deleteTask({ guildId: target.guild.id, userId: target.id });

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.UNMUTE,
					reason
				}
			});
		}

		return { success: true, dmResult };
	}

	public async timeout(
		target: GuildMember,
		{ reason, sendDm, silent, expiresIn }: TimeoutContext
	): Promise<{ success: boolean; dmResult: string }> {
		let dmResult = 'No DM sent';
		const defaultReason = reason ?? 'No reason provided.';
		const expiresAt = expiresIn ? expiresIn + Date.now() : undefined;

		if (sendDm !== false)
			dmResult = await this.sendDm(target, `You have been timed out in **${this.moderator.guild.name}**`, reason, {
				isMuteOrTimeout: 'timeout',
				expiresAt
			});

		await target.timeout(expiresIn, `${reason ?? 'No reason provided'} (Timed out by: ${this.moderator.user.tag})`);

		await container.moderation.cases.create(target, this.moderator, {
			type: ModerationActionType.TIMEOUT,
			reason: defaultReason,
			expiresIn
		});

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.TIMEOUT,
					reason,
					expiresIn
				}
			});
		}

		return { success: true, dmResult };
	}

	public async untimeout(target: GuildMember, { reason, sendDm, silent }: UntimeoutContext) {
		let dmResult = 'No DM sent';

		if (sendDm !== false) {
			dmResult = await this.sendDm(target, `You have been un-timed out in **${this.moderator.guild.name}**`, reason);
		}

		await target.timeout(null, `${reason ?? 'No reason provided'} (Un-timed out by: ${this.moderator.user.tag})`);

		if (!silent) {
			container.client.emit(KBotEvents.ModerationLog, {
				target,
				moderator: this.moderator,
				settings: this.settings,
				data: {
					type: ModerationActionType.UNTIMEOUT,
					reason
				}
			});
		}

		return { success: true, dmResult };
	}

	private async sendDm(
		target: GuildMember | User,
		description: string,
		reason?: string | null,
		{ isMuteOrTimeout, expiresAt }: { isMuteOrTimeout?: 'mute' | 'timeout'; expiresAt?: number | null } = {}
	): Promise<string> {
		const { guild } = this.moderator;

		try {
			const icon = getGuildIcon(guild);
			const embed = new EmbedBuilder() //
				.setColor(EmbedColors.Default)
				.setThumbnail(icon!)
				.setDescription(description)
				.setTimestamp();

			if (isMuteOrTimeout) {
				if (expiresAt) {
					const timestamp = Math.floor(expiresAt / 1000);
					embed.addFields([
						{
							name: `${isMuteOrTimeout === 'mute' ? 'Mute' : 'Timeout'} ends in`,
							value: `<t:${timestamp}:R> (<t:${timestamp}:f>)`
						}
					]);
				} else {
					embed.addFields([
						{
							name: `${isMuteOrTimeout === 'mute' ? 'Mute' : 'Timeout'} ends in`,
							value: 'Indefinite'
						}
					]);
				}
			}

			if (!isNullish(reason)) {
				embed.addFields([{ name: 'Reason', value: reason }]);
			}

			await target.send({
				embeds: [embed]
			});
			return '✔️ DM sent';
		} catch (err) {
			return '❌ Unable to DM user';
		}
	}
}
