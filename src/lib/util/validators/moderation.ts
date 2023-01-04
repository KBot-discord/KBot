import { KBotError } from '#lib/structures/KBotError';
import { KBotErrors } from '#utils/constants';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildMember } from 'discord.js';

export class ModerationActionValidator {
	public canBanTarget(moderator: GuildMember, target: GuildMember): { result: true; error?: undefined } | { result: false; error: KBotError } {
		let errorMessage: string | null = null;

		if (target.id === moderator.id) errorMessage = 'You cannot ban yourself.';

		if (target.id === moderator.guild.ownerId || target.permissions.has(PermissionFlagsBits.Administrator))
			errorMessage = 'You cannot ban yourself.';

		if (!target.bannable) errorMessage = "I don't have the required permission, or I am not high enough in the role hierarchy to ban that user.";

		if (!(target.id === moderator.guild.ownerId) && target.roles.highest.position >= moderator.roles.highest.position)
			errorMessage = "You cannot ban this user. (target's highest role is above or equal to yours)";

		if (!errorMessage) return { result: true };

		return {
			result: false,
			error: new KBotError({
				identifier: KBotErrors.ModerationPermissions,
				message: errorMessage
			})
		};
	}

	public canKickTarget() {}

	public canMuteTarget() {}

	public canTimeoutTarget() {}
}
