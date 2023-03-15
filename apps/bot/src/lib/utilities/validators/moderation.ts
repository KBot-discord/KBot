import { KBotErrors } from '#types/Enums';
import { KBotError } from '#structures/KBotError';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildMember } from 'discord.js';

export class ModerationActionValidator {
	public canBanTarget(moderator: GuildMember, target: GuildMember): { result: true; error?: undefined } | { result: false; error: KBotError } {
		let errorMessage: string | null = null;

		if (target.id === moderator.id) {
			errorMessage = 'You cannot ban yourself.';
		} else if (target.id === moderator.guild.ownerId || target.permissions.has(PermissionFlagsBits.Administrator))
			errorMessage = 'This user cannot be banned.';
		else if (!target.bannable) {
			errorMessage = "I don't have the required permission, or I am not high enough in the role hierarchy to ban that user.";
		} else if (moderator.guild.ownerId === moderator.id) {
			return { result: true };
		} else if (!(target.id === moderator.guild.ownerId) && target.roles.highest.position >= moderator.roles.highest.position) {
			errorMessage = "You cannot ban this user. (target's highest role is above or equal to yours)";
		}

		if (!errorMessage) {
			return { result: true };
		}

		return {
			result: false,
			error: new KBotError({
				identifier: KBotErrors.ModerationPermissions,
				message: errorMessage
			})
		};
	}

	public canKickTarget(moderator: GuildMember, target: GuildMember): { result: true; error?: undefined } | { result: false; error: KBotError } {
		let errorMessage: string | null = null;

		if (target.id === moderator.id) {
			errorMessage = 'You cannot kick yourself.';
		} else if (target.id === moderator.guild.ownerId || target.permissions.has(PermissionFlagsBits.Administrator)) {
			errorMessage = 'This user cannot be kicked.';
		} else if (!target.kickable) {
			errorMessage = "I don't have the required permission, or I am not high enough in the role hierarchy to kick that user.";
		} else if (moderator.guild.ownerId === moderator.id) {
			return { result: true };
		} else if (!(target.id === moderator.guild.ownerId) && target.roles.highest.position >= moderator.roles.highest.position) {
			errorMessage = "You cannot kick this user. (target's highest role is above or equal to yours)";
		}

		if (!errorMessage) {
			return { result: true };
		}

		return {
			result: false,
			error: new KBotError({
				identifier: KBotErrors.ModerationPermissions,
				message: errorMessage
			})
		};
	}

	public async canMuteTarget(
		moderator: GuildMember,
		target: GuildMember,
		muteRole: string | null
	): Promise<{ result: true; error?: undefined } | { result: false; error: KBotError }> {
		const client = await moderator.guild.members.fetchMe();
		let errorMessage: string | null = null;

		if (!muteRole) {
			errorMessage = 'There is no mute role set. Please run `/moderation set mute_role`.';
		} else if (target.roles.cache.get(muteRole)) {
			errorMessage = 'User is already muted';
		} else if (target.id === moderator.id) {
			errorMessage = 'You cannot mute yourself.';
		} else if (target.id === moderator.guild.ownerId || target.permissions.has(PermissionFlagsBits.Administrator)) {
			errorMessage = 'This user cannot be muted.';
		} else if (!client.permissions.has(PermissionFlagsBits.ManageRoles)) {
			errorMessage = "I don't have the required permission(s) to mute that user. Required permission(s): Manage Roles";
		} else if (moderator.guild.ownerId === moderator.id) {
			return { result: true };
		} else if (!(target.id === moderator.guild.ownerId) && target.roles.highest.position >= moderator.roles.highest.position) {
			errorMessage = "You cannot mute this user. (target's highest role is above or equal to yours)";
		}

		if (!errorMessage) {
			return { result: true };
		}

		return {
			result: false,
			error: new KBotError({
				identifier: KBotErrors.ModerationPermissions,
				message: errorMessage
			})
		};
	}

	public async canTimeoutTarget(
		moderator: GuildMember,
		target: GuildMember
	): Promise<{ result: true; error?: undefined } | { result: false; error: KBotError }> {
		const client = await moderator.guild.members.fetchMe();
		let errorMessage: string | null = null;

		if (target.isCommunicationDisabled()) {
			errorMessage = 'User is already timed out';
		} else if (target.id === moderator.id) {
			errorMessage = 'You cannot timeout yourself.';
		} else if (target.id === moderator.guild.ownerId || target.permissions.has(PermissionFlagsBits.Administrator)) {
			errorMessage = 'This user cannot be timed out.';
		} else if (!client.permissions.has(PermissionFlagsBits.ModerateMembers)) {
			errorMessage =
				"I don't have the required permission(s), or I am not high enough in the role hierarchy to timeout that user. Required permission(s): Timeout Members";
		} else if (moderator.guild.ownerId === moderator.id) {
			return { result: true };
		} else if (!(target.id === moderator.guild.ownerId) && target.roles.highest.position >= moderator.roles.highest.position) {
			errorMessage = "You cannot timeout this user. (target's highest role is above or equal to yours)";
		}

		if (!errorMessage) {
			return { result: true };
		}

		return {
			result: false,
			error: new KBotError({
				identifier: KBotErrors.ModerationPermissions,
				message: errorMessage
			})
		};
	}
}
