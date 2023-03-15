import { container } from '@sapphire/framework';
import type { PrismaClient } from '#prisma';
import type { TwitchAccountId, TwitchAccWithSubs, GuildAndTwitchAccountId, TwitchSubWithAcc, UpdateTwitchSubData } from '#types/database/Twitch';
import type { GuildId } from '#types/database';

export class TwitchSubscriptionService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ accountId, guildId }: GuildAndTwitchAccountId): Promise<TwitchSubWithAcc | null> {
		return this.database.twitchSubscription.findUnique({
			where: { guildId_accountId: { accountId, guildId } },
			include: { account: true }
		});
	}

	public async getByGuild({ guildId }: GuildId): Promise<TwitchSubWithAcc[]> {
		return this.database.twitchSubscription.findMany({
			where: { guildId },
			include: { account: true }
		});
	}

	public async getByAccount({ accountId }: TwitchAccountId): Promise<TwitchAccWithSubs | null> {
		return this.database.twitchAccount.findUnique({
			where: { id: accountId },
			include: { subscriptions: { where: { NOT: { discordChannelId: null } } } }
		});
	}

	public async delete({ guildId, accountId }: GuildAndTwitchAccountId): Promise<TwitchSubWithAcc | null> {
		return this.database.twitchSubscription
			.delete({
				where: { guildId_accountId: { accountId, guildId } },
				include: { account: true }
			})
			.catch(() => null);
	}

	public async create({ accountId, guildId }: GuildAndTwitchAccountId): Promise<TwitchSubWithAcc> {
		return this.database.twitchSubscription.create({
			data: {
				twitchSettings: { connect: { guildId } },
				account: { connect: { id: accountId } }
			},
			include: { account: true }
		});
	}

	public async update({ accountId, guildId }: GuildAndTwitchAccountId, data: UpdateTwitchSubData): Promise<TwitchSubWithAcc> {
		return this.database.twitchSubscription.update({
			where: { guildId_accountId: { accountId, guildId } },
			data,
			include: { account: true }
		});
	}

	public async countByAccount({ accountId }: TwitchAccountId): Promise<number> {
		return this.database.twitchSubscription.count({
			where: { accountId }
		});
	}
}
