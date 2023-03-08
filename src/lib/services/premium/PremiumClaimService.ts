import { container } from '@sapphire/framework';
import type { PremiumClaim, PrismaClient } from '#prisma';
import type { GuildAndPremiumUserId, PremiumUserId, UpdatePremiumClaimData } from '#types/database/Premium';
import type { GuildId } from '#types/database';

export class PremiumClaimService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async getByUser({ userId }: PremiumUserId) {
		return this.database.premiumClaim.findMany({
			where: { userId }
		});
	}

	public async getByGuild({ guildId }: GuildId) {
		return this.database.premiumClaim.findMany({
			where: { guildId }
		});
	}

	public async getAll() {
		return this.database.premiumClaim.findMany();
	}

	public async create({ guildId, userId }: GuildAndPremiumUserId): Promise<PremiumClaim | null> {
		return this.database.premiumClaim.create({
			data: {
				guildId,
				user: { connect: { id: userId } }
			}
		});
	}

	public async update({ guildId, userId }: GuildAndPremiumUserId, data: UpdatePremiumClaimData) {
		return this.database.premiumClaim.update({
			where: { userId_guildId: { guildId, userId } },
			data
		});
	}

	public async delete() {}
}
