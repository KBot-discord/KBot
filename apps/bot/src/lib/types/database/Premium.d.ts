import type { PremiumUser } from '#prisma';
import type { Expand } from '#types/Generic';
import type { GuildId } from '#types/database/index';

export interface PremiumUserId {
	userId: PremiumUser['id'];
}

export type GuildAndPremiumUserId = Expand<GuildId & PremiumUserId>;

export interface UpsertPremiumUserData {
	totalClaims: PremiumUser['totalClaims'];
}

export interface UpdatePremiumClaimData {
	startDate: Date | null;
	endDate: Date | null;
	guildId?: string;
}
