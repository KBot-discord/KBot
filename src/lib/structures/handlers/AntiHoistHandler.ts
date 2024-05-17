import type { ModerationSettings } from '@prisma/client';
import type { GuildMember } from 'discord.js';

export class AntiHoistHandler {
	public readonly usernameRegex = /^[0-9 !"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`]+/g;

	public async parseMember(member: GuildMember, settings: ModerationSettings): Promise<void> {
		if (!(settings.enabled && member.manageable && settings.antiHoistEnabled)) return;

		const currentName = member.nickname ?? member.user.username;

		if (this.usernameRegex.test(currentName)) {
			const newNickname = this.cleanUsername(currentName);

			if (currentName === newNickname) return;
			await member.setNickname(newNickname);
		}
	}

	private cleanUsername(username: string): string {
		const cleanedUsername = username.replaceAll(this.usernameRegex, '');
		return cleanedUsername === '' //
			? username
			: cleanedUsername;
	}
}
