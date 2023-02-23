import { moderationCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { PrismaClient, ModerationSettings } from '#prisma';
import type { QueryByGuildId, UpsertModerationSettingsData } from '#types/repositories';

export class ModerationSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly settingsKey = moderationCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ guildId }: QueryByGuildId): Promise<ModerationSettings | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get<ModerationSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.update(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.moderationSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async upsert({ guildId }: QueryByGuildId, data: UpsertModerationSettingsData): Promise<ModerationSettings> {
		const key = this.settingsKey(guildId);

		const settings = await this.database.moderationSettings.upsert({
			where: { guildId },
			update: data,
			create: {
				...data,
				coreSettings: {
					connectOrCreate: {
						where: { guildId },
						create: { guildId }
					}
				}
			}
		});
		await this.cache.setEx(key, settings, this.CacheTime);

		return settings;
	}
}
