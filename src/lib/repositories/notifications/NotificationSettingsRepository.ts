import { notificationCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { PrismaClient, NotificationSettings } from '#prisma';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { UpsertNotificationSettingsData, QueryByGuildId } from '#types/repositories';

export class NotificationSettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly settingsKey = notificationCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ guildId }: QueryByGuildId): Promise<NotificationSettings | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get<NotificationSettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.update(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.notificationSettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async upsert({ guildId }: QueryByGuildId, data: UpsertNotificationSettingsData): Promise<NotificationSettings> {
		const key = this.settingsKey(guildId);

		const settings = await this.database.notificationSettings.upsert({
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
