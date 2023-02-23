import { container } from '@sapphire/framework';
import type { ModerationCase, PrismaClient } from '#prisma';
import type { CaseByIdAndGuildId, CasesByUserAndGuildId, CreateCaseData, UpdateCaseData } from '#types/repositories/ModerationCaseRepository';
import type { QueryByGuildId } from '#types/repositories';

export class ModerationCaseRepository {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async findOne({ caseId, guildId }: CaseByIdAndGuildId): Promise<ModerationCase | null> {
		return this.database.moderationCase.findUnique({
			where: { caseId_guildId: { caseId, guildId } }
		});
	}

	public async findManyByUser({ userId, guildId }: CasesByUserAndGuildId): Promise<ModerationCase[]> {
		return this.database.moderationCase.findMany({
			where: { userId, guildId }
		});
	}

	public async findManyByGuild({ guildId }: QueryByGuildId): Promise<ModerationCase[]> {
		return this.database.moderationCase.findMany({
			where: { guildId }
		});
	}

	public async create(data: CreateCaseData): Promise<ModerationCase> {
		return this.database.$transaction(async (prisma) => {
			const count = await prisma.moderationCase.count({
				where: { guildId: data.guildId }
			});
			return this.database.moderationCase.create({
				data: { ...data, caseId: count + 1 }
			});
		});
	}

	public async update({ caseId, guildId }: CaseByIdAndGuildId, data: UpdateCaseData): Promise<ModerationCase> {
		return this.database.moderationCase.update({
			where: { caseId_guildId: { caseId, guildId } },
			data
		});
	}
}
