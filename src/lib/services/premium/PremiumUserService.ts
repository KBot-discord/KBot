import { container } from '@sapphire/framework';
import type { PremiumUser, PrismaClient } from '#prisma';
import type { PremiumUserId, UpsertPremiumUserData } from '#types/database/Premium';

export class PremiumUserService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ userId }: PremiumUserId): Promise<PremiumUser | null> {
		return this.database.premiumUser.findUnique({
			where: { id: userId }
		});
	}

	public async upsert({ userId }: PremiumUserId, data: UpsertPremiumUserData): Promise<PremiumUser> {
		return this.database.premiumUser.upsert({
			where: { id: userId },
			update: data,
			create: { ...data, id: userId }
		});
	}

	public async delete({ userId }: PremiumUserId): Promise<PremiumUser | null> {
		return this.database.premiumUser
			.delete({
				where: { id: userId }
			})
			.catch(() => null);
	}
}
