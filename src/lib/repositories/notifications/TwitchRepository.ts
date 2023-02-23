import { container } from '@sapphire/framework';
import type { PrismaClient, TwitchAccount } from '#prisma';
import type {
	CreateTwitchAccData,
	TwitchAccById,
	TwitchAccWithSubs,
	TwitchSubByIdAndGuildId,
	TwitchSubWithAcc,
	UpdateTwitchAccData,
	UpdateTwitchSubData
} from '#types/repositories/TwitchRepository';
import type { QueryByGuildId } from '#types/repositories';

export class TwitchRepository {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async updateAccount({ accountId }: TwitchAccById, data: UpdateTwitchAccData): Promise<TwitchAccount> {
		return this.database.twitchAccount.update({
			where: { id: accountId },
			data
		});
	}

	public async countAccounts() {
		return this.database.twitchAccount.count();
	}

	public async accountExists({ accountId }: TwitchAccById): Promise<boolean> {
		const result = await this.database.twitchAccount.count({
			where: { id: accountId }
		});
		return result > 0;
	}

	public async findOneSubscription({ accountId, guildId }: TwitchSubByIdAndGuildId): Promise<TwitchSubWithAcc | null> {
		return this.database.twitchSubscription.findUnique({
			where: { guildId_accountId: { accountId, guildId } },
			include: { account: true }
		});
	}

	public async findManySubscriptionsByGuild({ guildId }: QueryByGuildId): Promise<TwitchSubWithAcc[]> {
		return this.database.twitchSubscription.findMany({
			where: { guildId },
			include: { account: true }
		});
	}

	public async findManySubscriptionsByAccount({ accountId }: TwitchAccById): Promise<TwitchAccWithSubs | null> {
		return this.database.twitchAccount.findUnique({
			where: { id: accountId },
			include: { subscriptions: { where: { NOT: { discordChannelId: null } } } }
		});
	}

	public async deleteSubscription({ guildId, accountId }: TwitchSubByIdAndGuildId): Promise<TwitchSubWithAcc | null> {
		return this.database.twitchSubscription
			.delete({
				where: { guildId_accountId: { accountId, guildId } },
				include: { account: true }
			})
			.catch(() => null);
	}

	public async createSubscription({ accountId, guildId }: TwitchSubByIdAndGuildId, accountData: CreateTwitchAccData): Promise<TwitchSubWithAcc> {
		return this.database.twitchSubscription.create({
			data: {
				notificationSettings: { connect: { guildId } },
				account: {
					connectOrCreate: {
						where: { id: accountId },
						create: { ...accountData, id: accountId }
					}
				}
			},
			include: { account: true }
		});
	}

	public async updateSubscription({ accountId, guildId }: TwitchSubByIdAndGuildId, data: UpdateTwitchSubData): Promise<TwitchSubWithAcc> {
		return this.database.twitchSubscription.update({
			where: { guildId_accountId: { accountId, guildId } },
			data,
			include: { account: true }
		});
	}
}
