import { container } from '@sapphire/framework';
import type { CreateTwitchAccData, TwitchAccountId, UpdateTwitchAccData } from '#types/database/Twitch';
import type { PrismaClient, TwitchAccount } from '#prisma';

export class TwitchAccountService {
	private readonly database: PrismaClient;

	public constructor() {
		this.database = container.prisma;
	}

	public async get({ accountId }: TwitchAccountId): Promise<TwitchAccount | null> {
		return this.database.twitchAccount.findUnique({
			where: { id: accountId }
		});
	}

	public async create(data: CreateTwitchAccData): Promise<TwitchAccount> {
		return this.database.twitchAccount.create({
			data
		});
	}

	public async update({ accountId }: TwitchAccountId, data: UpdateTwitchAccData): Promise<TwitchAccount> {
		return this.database.twitchAccount.update({
			where: { id: accountId },
			data
		});
	}

	public async delete({ accountId }: TwitchAccountId): Promise<TwitchAccount | null> {
		return this.database.twitchAccount
			.delete({
				where: { id: accountId }
			})
			.catch(() => null);
	}

	public async count(): Promise<number> {
		return this.database.twitchAccount.count();
	}

	public async exists({ accountId }: TwitchAccountId): Promise<boolean> {
		const result = await this.database.twitchAccount.count({
			where: { id: accountId }
		});
		return result > 0;
	}
}
