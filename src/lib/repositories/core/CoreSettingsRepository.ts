import { guildCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { CoreSettings, PrismaClient } from '#prisma';
import type { QueryByGuildId, UpsertCoreSettingsData } from '#types/repositories';

export class CoreSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly settingsKey = guildCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ guildId }: QueryByGuildId): Promise<CoreSettings | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get<CoreSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.update(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.coreSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async upsert({ guildId }: QueryByGuildId, data: UpsertCoreSettingsData): Promise<CoreSettings> {
		const key = this.settingsKey(guildId);

		const settings = await this.database.coreSettings.upsert({
			where: { guildId },
			update: data,
			create: { ...data, guildId }
		});
		await this.cache.setEx(key, settings, this.CacheTime);

		return settings;
	}

	public async delete({ guildId }: QueryByGuildId): Promise<CoreSettings | null> {
		return this.database.coreSettings
			.delete({
				where: { guildId }
			})
			.catch(() => null);
	}
}
