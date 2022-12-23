import { GuildMember, MessageEmbed } from 'discord.js';
import { getServerIcon } from '../lib/util/util';
import { EmbedColors } from '../lib/util/constants';
import { MinageRepository } from '../lib/database/repositories/MinageRepository';

export class MinageService {
	private readonly repo;
	private readonly member: GuildMember;

	public constructor(member: GuildMember) {
		this.repo = new MinageRepository();
		this.member = member;
	}

	public async run(): Promise<boolean> {
		const config = await this.repo.getConfig(this.member.guild.id);
		if (!config || !config.req || config.req === 0) return false;

		const { req } = config;
		const createdAt = this.member.user.createdTimestamp;
		const { reqAge, reqDate } = this.calculateAge(req);
		if (createdAt <= reqAge) return false;

		try {
			await this.member.send({ embeds: [this.formatEmbed(req, reqDate, config.msg)] });
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
		const stampDays = `<t:${Math.floor(reqDate / 1000)}:R>`;
		const stampDate = `<t:${Math.floor(reqDate / 1000)}:D>`;

		let message: string;
		if (msg) {
			message = msg;
		} else {
			message =
				'Hello! You have been automatically kicked from [server] because your account age is less then [req] day(s) old. Please join again in [days] or on [date]. Thank you!';
		}

		const properMsg = message
			.replaceAll(/(\[server\])/, `**${this.member.guild.name}**`)
			.replaceAll(/(\[req\])/, `**${req}**`)
			.replaceAll(/(\[days\])/, `${stampDays}`)
			.replaceAll(/(\[date\])/, `${stampDate}`);

		const icon = getServerIcon(this.member.guild);

		return new MessageEmbed()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon!)
			.setDescription(`${properMsg}`);
	}
}
