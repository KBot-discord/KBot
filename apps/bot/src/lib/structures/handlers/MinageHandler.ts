import { ModerationModule } from '#modules/ModerationModule';
import { isNullish } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import type { ModerationSettings } from '#prisma';

export class MinageHandler {
	public constructor(private readonly member: GuildMember, private readonly settings: ModerationSettings) {}

	public async run(): Promise<boolean> {
		if (
			!this.settings.enabled || //
			!this.member.kickable ||
			isNullish(this.settings.minAccountAgeReq) ||
			this.settings.minAccountAgeReq === 0
		) {
			return false;
		}

		const { minAccountAgeReq: req, minAccountAgeMsg: msg } = this.settings;

		const createdAt = this.member.user.createdTimestamp;
		const { reqAge, reqDate } = this.calculateAge(req);
		if (createdAt <= reqAge) return false;

		try {
			await this.member.send({ embeds: [ModerationModule.formatMinageEmbed(this.member, msg, req, reqDate)] }).catch(() => null);
			await this.member.kick(`Account too new. Required age: ${req}, Account age: ${Math.floor((Date.now() - createdAt) / 86400000)}`);
			return true;
		} catch (err: unknown) {
			container.logger.error(err);
			return false;
		}
	}

	private calculateAge(req: number) {
		const creation = this.member.user.createdTimestamp;
		const reqDay = Math.floor(86400000 * req);
		const reqAge = Math.floor(Date.now() - reqDay);
		const reqDate = Math.floor(creation + reqDay);

		return { reqAge, reqDate };
	}

	public static defaultMessage =
		'Hello! You have been automatically kicked from {server} because your account age is less then {req} day(s) old. Please join again in {days} or on {date}. Thank you!';
}
