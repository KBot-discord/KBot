import { EmbedColors } from '#utils/constants';
import { ModerationModule } from '#modules/ModerationModule';
import { getGuildIcon } from '#utils/Discord';
import { EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
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
			await this.member.send({ embeds: [this.formatEmbed(req, reqDate, msg)] });
			await this.member.kick(`Account too new. Required age: ${req}, Account age: ${Math.floor((Date.now() - createdAt) / 86400000)}`);
			return true;
		} catch {
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

	private formatEmbed(req: number, reqDate: number, msg: string | null) {
		const message = msg ?? MinageHandler.defaultMessage;

		const properMessage = ModerationModule.formatMinageMessage(message, this.member, req, reqDate);
		const icon = getGuildIcon(this.member.guild);

		return new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon!)
			.setDescription(properMessage);
	}

	public static defaultMessage =
		'Hello! You have been automatically kicked from {server} because your account age is less then {req} day(s) old. Please join again in {days} or on {date}. Thank you!';
}
