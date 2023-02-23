import { container } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import type { ModerationSettings } from '#prisma';

export class AntiHoistSubmodule {
	public readonly usernameRegex = /^[0-9 !"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`]+/g;

	public async parseMember(member: GuildMember, settings: ModerationSettings): Promise<void> {
		if (!settings.enabled || !member.manageable || !settings.antiHoistEnabled) return;
		const { antiHoist } = container.moderation;

		const currentName = member.nickname ?? member.user.username;

		if (antiHoist.usernameRegex.test(currentName)) {
			const newNickname = antiHoist.cleanUsername(currentName);
			await member.setNickname(newNickname);
		}
	}

	public cleanUsername(username: string) {
		const cleanedUsername = username.replaceAll(this.usernameRegex, '');
		return cleanedUsername === '' //
			? 'PleaseChooseAValidUsername'
			: cleanedUsername;
	}
}
