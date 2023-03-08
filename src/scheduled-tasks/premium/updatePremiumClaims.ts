import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { Collection } from 'discord.js';
import type { PremiumClaim } from '#prisma';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 */10 * * * *', // Every 10 minutes
	enabled: false
})
export class PremiumTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		const premiumClaims = await this.container.premium.claims.getAll();
		if (premiumClaims.length < 1) return;

		const claimCollection = new Collection<string, PremiumClaim[]>();

		for (const claim of premiumClaims) {
			const array = claimCollection.get(claim.guildId) ?? [];
			array.push(claim);
			claimCollection.set(claim.guildId, array);
		}

		let updatedClaimCount = 0;
		for (const entry of claimCollection.values()) {
			if (entry.some((claim) => claim.endDate && claim.endDate < new Date())) {
				let oldestClaim: PremiumClaim = entry[0];

				for (const claim of entry) {
					if (claim.createdAt < oldestClaim.createdAt) {
						oldestClaim = claim;
					}
				}

				await this.container.prisma.$transaction(async (prisma) => {
					await prisma.premiumClaim.delete({
						where: { guildId: oldestClaim.guildId, userId: oldestClaim.userId }
					});

					const now = new Date();
					await this.container.premium.claims.update(
						{
							guildId: oldestClaim.guildId,
							userId: oldestClaim.userId
						},
						{
							startDate: now,
							endDate: new Date(now.getDay() + 30)
						}
					);
				});

				updatedClaimCount++;
			}
		}

		if (updatedClaimCount > 0) {
			this.container.logger.info(`[UpdatePremiumClaims] Updated ${updatedClaimCount} claims`);
		}
	}
}
