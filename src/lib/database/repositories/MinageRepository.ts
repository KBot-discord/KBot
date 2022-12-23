import { container } from '@sapphire/framework';
import { minageCacheKey } from '../../util/cacheKeys';

export class MinageRepository {
	private readonly db;
	private readonly cache;

	private readonly cacheKey = minageCacheKey;

	public constructor() {
		this.db = container.db.moderationModule;
		this.cache = container.redis;
	}

	public async getConfig(guildId: string): Promise<{ req: number; msg: string | null } | null> {
		const key = this.cacheKey(guildId);
		const cacheResult = await this.cache.get<{ req: string; msg: string }>(key);
		if (cacheResult) {
			await this.cache.update(key, 5);
			return { req: parseInt(cacheResult.req, 10), msg: cacheResult.msg };
		}

		const dbResult = await this.db.findUnique({
			where: { id: guildId },
			select: { minAccountAgeReq: true, minAccountAgeMsg: true }
		});
		if (!dbResult || !dbResult.minAccountAgeReq) return null;
		await this.cache.setEx<{ req: number | null; msg: string | null }>(
			key,
			{ req: dbResult.minAccountAgeReq, msg: dbResult.minAccountAgeMsg },
			5
		);
		return { req: dbResult.minAccountAgeReq, msg: dbResult.minAccountAgeMsg };
	}

	public async upsertConfig(guildId: string, { req, msg }: { req: number; msg: string | null }) {
		const key = this.cacheKey(guildId);
		const result = await this.db.upsert({
			where: { id: guildId },
			update: { minAccountAgeReq: req, minAccountAgeMsg: msg },
			create: { minAccountAgeReq: req, minAccountAgeMsg: msg, guild: { connect: { id: guildId } } }
		});
		await this.cache.setEx<{ req: number | null; msg: string | null }>(key, { req: result.minAccountAgeReq, msg: result.minAccountAgeMsg }, 60);
		return { req: result.minAccountAgeReq, msg: result.minAccountAgeMsg };
	}
}
