import { BlankSpace, EmbedColors } from '#utils/constants';
import { ModerationActionType } from '#prisma';
import { EmbedBuilder } from 'discord.js';
import { userMention } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import type { GuildId } from '#types/database';
import type { GuildAndUserId, GuildAndCaseId, UpdateCaseData } from '#types/database/ModerationCase';
import type { ModerationCase, PrismaClient } from '#prisma';
import type { ModerationActionContext } from '#types/Moderation';
import type { GuildMember } from 'discord.js';

export class ModerationCaseService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ guildId, caseId }: GuildAndCaseId): Promise<ModerationCase | null> {
		return this.database.moderationCase.findUnique({
			where: { caseId_guildId: { caseId, guildId } }
		});
	}

	public async getByUser({ guildId, userId }: GuildAndUserId): Promise<ModerationCase[]> {
		return this.database.moderationCase.findMany({
			where: { userId, guildId }
		});
	}

	public async getByGuild({ guildId }: GuildId): Promise<ModerationCase[]> {
		return this.database.moderationCase.findMany({
			where: { guildId }
		});
	}

	public async create(target: GuildMember, moderator: GuildMember, { type, reason, duration }: ModerationActionContext) {
		const data = {
			guildId: moderator.guild.id,
			userId: target.id,
			userTag: target.user.tag,
			moderatorId: moderator.id,
			moderatorTag: moderator.user.tag,
			type,
			reason: reason ?? undefined,
			duration: duration ? BigInt(duration) : undefined
		};

		return this.database.$transaction(async (prisma) => {
			const count = await prisma.moderationCase.count({
				where: { guildId: data.guildId }
			});
			return this.database.moderationCase.create({
				data: { ...data, caseId: count + 1 }
			});
		});
	}

	public async update({ guildId, caseId }: GuildAndCaseId, data: UpdateCaseData): Promise<ModerationCase> {
		return this.database.moderationCase.update({
			where: { caseId_guildId: { caseId, guildId } },
			data
		});
	}

	public buildEmbed({ caseId, userId, moderatorId, type, reason, duration }: ModerationCase): EmbedBuilder {
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
