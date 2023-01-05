import { getServerIcon } from '#utils/util';
import { EmbedColors } from '#utils/constants';
import { ModerationService } from '#services/ModerationService';
import { GuildMember, MessageEmbed } from 'discord.js';
import { container } from '@sapphire/framework';

export class MinageService {
	private readonly member: GuildMember;

	public constructor(member: GuildMember) {
		this.member = member;
	}

	public async run(): Promise<boolean> {
		const settings = await container.moderation.repo.getSettings(this.member.guild.id);

		if (!settings || !settings.minAccountAgeReq || settings.minAccountAgeReq === 0) return false;

		const { minAccountAgeReq: req, minAccountAgeMsg: msg } = settings;

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
		const message =
			msg ??
			'Hello! You have been automatically kicked from {server} because your account age is less then {req} day(s) old. Please join again in {days} or on {date}. Thank you!';

		const properMessage = ModerationService.formatMinageMessage(message, this.member, req, reqDate);
		const icon = getServerIcon(this.member.guild);

		return new MessageEmbed()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon!)
			.setDescription(properMessage);
	}
}
