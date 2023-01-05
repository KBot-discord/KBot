import { ModerationRepository } from '#lib/database/repositories/ModerationRepository';
import type { GuildMember } from 'discord.js';

export class ModerationService {
	public readonly repo;

	public constructor() {
		this.repo = new ModerationRepository();
	}

	public static formatMinageMessage(message: string, member: GuildMember, req: number, reqDate: number): string {
		const stampDays = `<t:${Math.floor(reqDate / 1000)}:R>`;
		const stampDate = `<t:${Math.floor(reqDate / 1000)}:D>`;

		return message
			.replaceAll(/({server})/, `**${member.guild.name}**`)
			.replaceAll(/({req})/, `**${req}**`)
			.replaceAll(/({days})/, `${stampDays}`)
			.replaceAll(/({date})/, `${stampDate}`);
	}
}
