import { coreCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { CoreSettings, PrismaClient } from '#prisma';
import type { RedisClient } from '#extensions/RedisClient';
import type { GuildId, UpsertCoreSettingsData } from '#types/database';

export class CoreSettingsService {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly cacheKey = coreCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async get({ guildId }: GuildId): Promise<CoreSettings | null> {
		if (isNullish(guildId)) return null;
		const key = this.cacheKey(guildId);

		const cacheResult = await this.cache.get<CoreSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.updateExpiry(key, this.CacheTime);
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

	public async upsert({ guildId }: GuildId, data: UpsertCoreSettingsData): Promise<CoreSettings> {
		const key = this.cacheKey(guildId);

		const settings = await this.database.coreSettings.upsert({
			where: { guildId },
			update: data,
			create: { ...data, guildId }
		});
		await this.cache.setEx(key, settings, this.CacheTime);

		return settings;
	}

	public async delete({ guildId }: GuildId): Promise<CoreSettings | null> {
		const key = this.cacheKey(guildId);

		await this.cache.delete(key);

		return this.database.coreSettings
			.delete({
				where: { guildId }
			})
			.catch(() => null);
	}
}
