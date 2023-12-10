import { isNullOrUndefined } from '#lib/utilities/functions';
import { container } from '@sapphire/framework';
import type { ModerationSettings } from '@prisma/client';
import type { GuildMember } from 'discord.js';

export class MinageHandler {
	public constructor(
		private readonly member: GuildMember,
		private readonly settings: ModerationSettings
	) {}

	public async run(): Promise<boolean> {
		const { moderation } = container;

		if (
			!this.settings.enabled || //
			!this.member.kickable ||
			isNullOrUndefined(this.settings.minAccountAgeReq) ||
			this.settings.minAccountAgeReq === 0
		) {
			return false;
		}

		const { minAccountAgeReq: req, minAccountAgeMsg: msg } = this.settings;

		const createdAt = this.member.user.createdTimestamp;
		const { reqAge, reqDate } = this.calculateAge(req);
		if (createdAt <= reqAge) return false;

		await this.member.send({ embeds: [moderation.formatMinageEmbed(this.member, msg, req, reqDate)] }).catch(() => null);
		await this.member.kick(`Account too new. Required age: ${req}, Account age: ${Math.floor((Date.now() - createdAt) / 86400000)}`);

		return true;
	}

	private calculateAge(req: number): {
		reqAge: number;
		reqDate: number;
	} {
		const creation = this.member.user.createdTimestamp;
		const reqDay = Math.floor(86400000 * req);
		const reqAge = Math.floor(Date.now() - reqDay);
		const reqDate = Math.floor(creation + reqDay);

		return { reqAge, reqDate };
	}

	public static defaultMessage =
		'Hello! You have been automatically kicked from {server} because your account age is less then {req} day(s) old. Please join again in {days} or on {date}. Thank you!';
}
