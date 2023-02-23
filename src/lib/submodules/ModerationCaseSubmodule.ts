import { ModerationCaseRepository } from '#repositories';
import { BlankSpace, EmbedColors } from '#utils/constants';
import { ModerationActionType } from '#prisma';
import { EmbedBuilder } from 'discord.js';
import { userMention } from '@discordjs/builders';
import type { ModerationCase } from '#prisma';
import type { ModerationActionContext } from '#types/Moderation';
import type { UpdateCaseData } from '#types/repositories/ModerationCaseRepository';
import type { GuildMember } from 'discord.js';

export class ModerationCaseSubmodule {
	private readonly repository: ModerationCaseRepository;

	public constructor() {
		this.repository = new ModerationCaseRepository();
	}

	public async getCase(guildId: string, caseId: number) {
		return this.repository.findOne({ caseId, guildId });
	}

	public async getUserCases(guildId: string, userId: string) {
		return this.repository.findManyByUser({ userId, guildId });
	}

	public async getGuildCases(guildId: string) {
		return this.repository.findManyByGuild({ guildId });
	}

	public async createCase(target: GuildMember, moderator: GuildMember, { type, reason, duration }: ModerationActionContext) {
		return this.repository.create({
			guildId: moderator.guild.id,
			userId: target.id,
			userTag: target.user.tag,
			moderatorId: moderator.id,
			moderatorTag: moderator.user.tag,
			type,
			reason: reason ?? undefined,
			duration: duration ? BigInt(duration) : undefined
		});
	}

	public async updateCase(guildId: string, caseId: number, data: UpdateCaseData) {
		return this.repository.update({ caseId, guildId }, data);
	}

	public buildCaseEmbed({ caseId, userId, moderatorId, type, reason, duration }: ModerationCase): EmbedBuilder {
		const embed = new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setTitle(`Case #${caseId}`)
			.setFields([
				{ name: 'User', value: userMention(userId), inline: true },
				{ name: 'Moderator', value: userMention(moderatorId), inline: true },
				{ name: BlankSpace, value: BlankSpace },
				{ name: 'Type', value: reason },
				{ name: 'Reason', value: reason }
			]);

		if (type === (ModerationActionType.MUTE || ModerationActionType.TIMEOUT)) {
			embed.spliceFields(2, 0, { name: 'Duration', value: `${duration}` ?? 'Indefinite', inline: true });
		}
		if (duration) {
			embed.addFields({ name: 'Duration', value: reason });
		}

		return embed;
	}
}
