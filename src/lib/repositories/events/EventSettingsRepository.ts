import { eventCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { EventSettings, PrismaClient } from '#prisma';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { QueryByGuildId, UpsertEventSettingsData } from '#types/repositories';

export class EventSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly settingsKey = eventCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ guildId }: QueryByGuildId): Promise<EventSettings | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get<EventSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.update(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.eventSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async upsert({ guildId }: QueryByGuildId, data: UpsertEventSettingsData): Promise<EventSettings> {
		const key = this.settingsKey(guildId);

		const settings = await this.database.eventSettings.upsert({
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
