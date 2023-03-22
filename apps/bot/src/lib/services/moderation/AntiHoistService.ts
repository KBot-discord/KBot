import type { GuildMember } from 'discord.js';
import type { ModerationSettings } from '#prisma';

export class AntiHoistService {
	public readonly usernameRegex = /^[0-9 !"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`]+/g;

	public async parseMember(member: GuildMember, settings: ModerationSettings): Promise<void> {
		if (!settings.enabled || !member.manageable || !settings.antiHoistEnabled) return;

		const currentName = member.nickname ?? member.user.username;

		if (this.usernameRegex.test(currentName)) {
			const newNickname = this.cleanUsername(currentName);
			await member.setNickname(newNickname);
		}
	}

	public cleanUsername(username: string): string {
		const cleanedUsername = username.replaceAll(this.usernameRegex, '');
		return cleanedUsername === '' //
			? 'PleaseChooseAValidUsername'
			: cleanedUsername;
	}
}
