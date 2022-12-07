import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildMember, MessageEmbed } from 'discord.js';
import { getServerIcon } from '../lib/util/util';
import { EmbedColors } from '../lib/util/constants';

export class MinageService {
	private readonly member: GuildMember;

	public constructor(member: GuildMember) {
		this.member = member;
	}

	public async run(): Promise<boolean> {
		const config = await this.getReq(this.member.guild.id);
		if (isNullish(config) || isNullish(config.req) || config.req === '0') return false;

		const req = parseInt(config.req, 10);
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

	private async getReq(guildId: string): Promise<{ req: string; msg: string } | null> {
		let req = await container.redis.fetch(`minage:guild:${guildId}:req`);
		let msg = await container.redis.fetch(`minage:guild:${guildId}:msg`);

		if (isNullish(req)) {
			const data = await container.db.moderationModule.findUnique({
				where: { id: guildId }
			});
			if (isNullish(data)) return null;
			req = data.minAccountAgeReq;
			msg = data.minAccountAgeMsg;
			await container.redis.addEx(`minage:guild:${guildId}:req`, req, 3600);
			await container.redis.addEx(`minage:guild:${guildId}:msg`, msg, 3600);
		}
		return { req, msg };
	}

	private calculateAge(req: number) {
		const creation = this.member.user.createdTimestamp;
		const reqDay = Math.floor(86400000 * req);
		const reqAge = Math.floor(Date.now() - reqDay);
		const reqDate = Math.floor(creation + reqDay);

		return { reqAge, reqDate };
	}

	private formatEmbed(req: number, reqDate: number, msg: string) {
		const stampDays = `<t:${Math.floor(reqDate / 1000)}:R>`;
		const stampDate = `<t:${Math.floor(reqDate / 1000)}:D>`;

		const properMsg = msg
			.replace(/(\[server])/g, `**${this.member.guild.name}**`)
			.replace(/(\[req])/g, `**${req}**`)
			.replace(/(\[days])/g, `${stampDays}`)
			.replace(/(\[date])/g, `${stampDate}`);

		const icon = getServerIcon(this.member.guild);

		return new MessageEmbed()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon!)
			.setDescription(`${properMsg}`);
	}
}
